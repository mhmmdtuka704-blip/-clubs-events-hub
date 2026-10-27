import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AppError,
  applyCommand,
  createInitialState,
  eventHasStarted,
  publicUser,
  validateEvent,
} from '../src/lib/model.js';
import { safeReturnTo } from '../src/lib/navigation.js';

const now = new Date(2026, 9, 26, 12);
let sequence = 0;
const options = { now, id: () => `generated-${++sequence}` };
const run = (state, command) => applyCommand(state, command, options);
const authenticated = (userId = 'demo-1') => ({
  ...createInitialState(now),
  currentUserId: userId,
});
const validUser = {
  name: ' New Student ',
  email: ' STUDENT@example.test ',
  password: 'Password2026',
  confirmPassword: 'Password2026',
};
const validEvent = {
  title: 'A new campus workshop',
  summary: 'A useful gathering for curious students.',
  description: 'A practical workshop where students can learn, discuss and build together.',
  clubId: 'tech-collective',
  category: 'Technology',
  date: '2026-10-29',
  time: '16:30',
  location: 'Innovation Lab',
  capacity: '12',
  bring: 'Bring a notebook\n\nEveryone is welcome',
};
const throwsCode = (callback, code) =>
  assert.throws(callback, (error) => error instanceof AppError && error.code === code);

test('registration normalizes input, logs in and never exposes a password in its result', () => {
  const original = createInitialState(now);
  const result = run(original, { type: 'REGISTER', values: validUser });
  assert.equal(result.state.users.length, 3);
  assert.equal(result.value.name, 'New Student');
  assert.equal(result.value.email, 'student@example.test');
  assert.equal(result.state.currentUserId, result.value.id);
  assert.ok(!('password' in result.value));
  assert.equal(original.users.length, 2);
});
test('duplicate email registration is rejected regardless of letter case', () => {
  throwsCode(
    () =>
      run(createInitialState(now), {
        type: 'REGISTER',
        values: { ...validUser, email: 'ALEX@CAMPUS.TEST' },
      }),
    'validation',
  );
});

test('password confirmation is required even when all fields are empty', () => {
  assert.throws(
    () => run(createInitialState(now), { type: 'REGISTER', values: {} }),
    (error) => error.fields.confirmPassword === 'Confirm your password.',
  );
});
test('registration reports errors for all invalid fields', () => {
  assert.throws(
    () =>
      run(createInitialState(now), {
        type: 'REGISTER',
        values: { name: '', email: 'bad', password: 'short', confirmPassword: 'different' },
      }),
    (error) => Object.keys(error.fields).length === 4,
  );
});
test('login accepts case-insensitive email and preserves password case', () => {
  const result = run(createInitialState(now), {
    type: 'LOGIN',
    email: ' ALEX@campus.test ',
    password: 'Campus2026!',
  });
  assert.equal(result.state.currentUserId, 'demo-1');
  throwsCode(
    () =>
      run(createInitialState(now), {
        type: 'LOGIN',
        email: 'alex@campus.test',
        password: 'campus2026!',
      }),
    'credentials',
  );
});
test('login validates empty input before checking mock credentials', () => {
  throwsCode(
    () => run(createInitialState(now), { type: 'LOGIN', email: '', password: '' }),
    'validation',
  );
});
test('a registered account can log out and log back in during the same session', () => {
  const registered = run(createInitialState(now), { type: 'REGISTER', values: validUser });
  const loggedOut = run(registered.state, { type: 'LOGOUT' }).state;
  assert.equal(loggedOut.currentUserId, null);
  const loggedIn = run(loggedOut, {
    type: 'LOGIN',
    email: 'student@example.test',
    password: validUser.password,
  });
  assert.equal(loggedIn.value.id, registered.value.id);
});
test('all mutations require a current user', () => {
  for (const type of ['CREATE_EVENT', 'UPDATE_EVENT', 'DELETE_EVENT', 'RSVP', 'CANCEL_RSVP'])
    throwsCode(
      () => run(createInitialState(now), { type, eventId: 'web-workshop', values: validEvent }),
      'unauthenticated',
    );
});
test('creating an event stores normalized fields and creator ownership', () => {
  const original = authenticated();
  const result = run(original, { type: 'CREATE_EVENT', values: validEvent });
  assert.equal(result.value.capacity, 12);
  assert.equal(result.value.creatorId, 'demo-1');
  assert.deepEqual(result.value.bring, ['Bring a notebook', 'Everyone is welcome']);
  assert.equal(result.state.events.length, original.events.length + 1);
  assert.equal(original.events.length, 9);
});
test('invalid calendar dates and past or malformed times are rejected', () => {
  for (const values of [
    { ...validEvent, date: '2026-02-31' },
    { ...validEvent, date: '2026-10-25' },
    { ...validEvent, time: '25:00' },
    { ...validEvent, date: '', time: '' },
  ])
    assert.throws(() => validateEvent(values, { now }), AppError);
});
test('unknown clubs, categories and invalid capacities are rejected', () => {
  for (const values of [
    { ...validEvent, clubId: 'missing' },
    { ...validEvent, category: 'Unknown' },
    { ...validEvent, capacity: '' },
    { ...validEvent, capacity: '1.5' },
    { ...validEvent, capacity: '501' },
  ])
    assert.throws(() => validateEvent(values, { now }), AppError);
});
test('long titles and excessive event notes are rejected', () => {
  assert.throws(() => validateEvent({ ...validEvent, title: 'x'.repeat(101) }, { now }), AppError);
  assert.throws(
    () => validateEvent({ ...validEvent, bring: Array(11).fill('note').join('\n') }, { now }),
    AppError,
  );
});
test('editing updates the same event and preserves its ID and creator', () => {
  const created = run(authenticated(), { type: 'CREATE_EVENT', values: validEvent });
  const result = run(created.state, {
    type: 'UPDATE_EVENT',
    eventId: created.value.id,
    values: { ...validEvent, title: 'Updated campus workshop', id: 'forged', creatorId: 'demo-2' },
  });
  assert.equal(result.value.id, created.value.id);
  assert.equal(result.value.creatorId, 'demo-1');
  assert.equal(
    result.state.events.find((event) => event.id === created.value.id).title,
    'Updated campus workshop',
  );
  assert.equal(created.value.title, validEvent.title);
});
test('another user cannot edit or delete a creator’s event', () => {
  const created = run(authenticated(), { type: 'CREATE_EVENT', values: validEvent });
  const other = { ...created.state, currentUserId: 'demo-2' };
  for (const type of ['UPDATE_EVENT', 'DELETE_EVENT'])
    throwsCode(
      () => run(other, { type, eventId: created.value.id, values: validEvent }),
      'forbidden',
    );
});
test('RSVP adds one user-event record and repeated RSVP is rejected', () => {
  const original = authenticated();
  const result = run(original, { type: 'RSVP', eventId: 'web-workshop' });
  assert.equal(result.state.rsvps.length, original.rsvps.length + 1);
  throwsCode(() => run(result.state, { type: 'RSVP', eventId: 'web-workshop' }), 'duplicate');
});
test('capacity is enforced for the last available place', () => {
  const state = authenticated();
  const event = state.events.find((event) => event.id === 'web-workshop');
  const fullState = {
    ...state,
    events: state.events.map((item) => (item.id === event.id ? { ...item, capacity: 1 } : item)),
  };
  throwsCode(() => run(fullState, { type: 'RSVP', eventId: event.id }), 'full');
});
test('RSVP cannot be added after the event starts', () => {
  const state = authenticated();
  const past = {
    ...state,
    events: state.events.map((item) =>
      item.id === 'web-workshop' ? { ...item, date: '2026-10-25' } : item,
    ),
  };
  throwsCode(() => run(past, { type: 'RSVP', eventId: 'web-workshop' }), 'past_event');
  assert.equal(eventHasStarted({ date: '2026-10-26', time: '12:00' }, now), true);
});
test('cancellation removes only the current user’s RSVP and is repeatable', () => {
  const joined = run(authenticated(), { type: 'RSVP', eventId: 'web-workshop' }).state;
  const cancelled = run(joined, { type: 'CANCEL_RSVP', eventId: 'web-workshop' }).state;
  assert.ok(
    !cancelled.rsvps.some((item) => item.userId === 'demo-1' && item.eventId === 'web-workshop'),
  );
  assert.ok(
    cancelled.rsvps.some((item) => item.userId === 'demo-2' && item.eventId === 'web-workshop'),
  );
  assert.deepEqual(
    run(cancelled, { type: 'CANCEL_RSVP', eventId: 'web-workshop' }).state.rsvps,
    cancelled.rsvps,
  );
});
test('deleting an event removes its RSVPs and leaves other events untouched', () => {
  const state = authenticated();
  const result = run(state, { type: 'DELETE_EVENT', eventId: 'web-workshop' }).state;
  assert.ok(!result.events.some((event) => event.id === 'web-workshop'));
  assert.ok(!result.rsvps.some((item) => item.eventId === 'web-workshop'));
  assert.ok(result.rsvps.some((item) => item.eventId === 'ai-discussion'));
  assert.equal(state.events.length, 9);
});
test('capacity cannot be reduced below the existing number of attendees', () => {
  const joined = run(authenticated(), { type: 'RSVP', eventId: 'web-workshop' }).state;
  throwsCode(
    () =>
      run(joined, {
        type: 'UPDATE_EVENT',
        eventId: 'web-workshop',
        values: { ...validEvent, capacity: 1 },
      }),
    'validation',
  );
});
test('missing event IDs fail safely', () => {
  for (const type of ['UPDATE_EVENT', 'DELETE_EVENT', 'RSVP', 'CANCEL_RSVP'])
    throwsCode(
      () => run(authenticated(), { type, eventId: 'missing', values: validEvent }),
      'not_found',
    );
});
test('fresh sessions reset mock changes and remove the current user', () => {
  const original = createInitialState(now);
  const registered = run(original, { type: 'REGISTER', values: validUser });
  assert.equal(registered.state.users.length, 3);
  assert.deepEqual(createInitialState(now), original);
  assert.equal(createInitialState(now).currentUserId, null);
});
test('public profile hides mock passwords', () => {
  assert.equal(publicUser(null), null);
  assert.deepEqual(publicUser({ id: '1', name: 'Alex', password: 'private' }), {
    id: '1',
    name: 'Alex',
  });
});
test('return paths reject external destinations and auth loops', () => {
  for (const path of [
    null,
    'https://example.com',
    '//example.com',
    '/\\example.com',
    '/login',
    '/register?returnTo=/login',
  ])
    assert.equal(safeReturnTo(path), '/dashboard');
  assert.equal(safeReturnTo('/events/web-workshop?from=login'), '/events/web-workshop?from=login');
});

test('return paths reject URL control-character normalization', () => {
  assert.equal(safeReturnTo('/\n/example.com'), '/dashboard');
  assert.equal(safeReturnTo('/\t/example.com'), '/dashboard');
});
