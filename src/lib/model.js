import { categories, clubs, createSeedEvents } from '../data/seed.js';
import { localDate } from './events.js';

export const DEMO_ACCOUNTS = [
  { id: 'demo-1', name: 'Alex Morgan', email: 'alex@campus.test', password: 'Campus2026!' },
  { id: 'demo-2', name: 'Maya Haddad', email: 'maya@campus.test', password: 'Campus2026!' },
];

export class AppError extends Error {
  constructor(message, code = 'invalid', fields = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.fields = fields;
  }
}

export function createInitialState(now = new Date()) {
  return {
    users: DEMO_ACCOUNTS.map((user) => ({ ...user })),
    events: createSeedEvents(now),
    rsvps: [
      { id: 'rsvp-seed-1', userId: 'demo-1', eventId: 'ai-discussion' },
      { id: 'rsvp-seed-2', userId: 'demo-2', eventId: 'web-workshop' },
    ],
    currentUserId: null,
  };
}

export function publicUser(user) {
  if (!user) return null;
  const { password, ...profile } = user;
  return profile;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value) => String(value ?? '').trim();

export function validateRegistration(values, users) {
  const user = {
    name: clean(values.name),
    email: clean(values.email).toLowerCase(),
    password: String(values.password ?? ''),
  };
  const fields = {};
  if (user.name.length < 2 || user.name.length > 60)
    fields.name = 'Use between 2 and 60 characters for your name.';
  if (!emailPattern.test(user.email) || user.email.length > 254)
    fields.email = 'Enter a valid email address.';
  else if (users.some((existing) => existing.email.toLowerCase() === user.email))
    fields.email = 'An account with this email already exists. Try logging in.';
  if (
    user.password.length < 8 ||
    user.password.length > 128 ||
    !/[a-zA-Z]/.test(user.password) ||
    !/\d/.test(user.password)
  )
    fields.password = 'Use 8 to 128 characters, including a letter and a number.';
  if (!values.confirmPassword) fields.confirmPassword = 'Confirm your password.';
  else if (values.confirmPassword !== user.password)
    fields.confirmPassword = 'The passwords do not match.';
  if (Object.keys(fields).length)
    throw new AppError('Please check the highlighted fields.', 'validation', fields);
  return user;
}

export function validateEvent(values, { now = new Date(), minimumCapacity = 0 } = {}) {
  const event = {
    title: clean(values.title),
    summary: clean(values.summary),
    description: clean(values.description),
    clubId: clean(values.clubId),
    category: clean(values.category),
    location: clean(values.location),
    date: clean(values.date),
    time: clean(values.time),
    capacity: Number(values.capacity),
    bring: String(values.bring ?? '')
      .split('\n')
      .map(clean)
      .filter(Boolean),
  };
  const fields = {};
  for (const [key, label, min, max] of [
    ['title', 'Title', 5, 100],
    ['summary', 'Summary', 10, 160],
    ['description', 'Description', 20, 4000],
    ['location', 'Location', 3, 120],
  ]) {
    if (event[key].length < min || event[key].length > max)
      fields[key] = `${label} must contain ${min} to ${max} characters.`;
  }
  if (!clubs.some((club) => club.id === event.clubId))
    fields.clubId = 'Choose one of the available clubs.';
  if (!categories.includes(event.category)) fields.category = 'Choose an available category.';
  const start = new Date(`${event.date}T${event.time}`);
  const validDate =
    /^\d{4}-\d{2}-\d{2}$/.test(event.date) &&
    !Number.isNaN(start.valueOf()) &&
    localDate(start) === event.date;
  if (!validDate) fields.date = 'Choose a valid calendar date.';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(event.time)) fields.time = 'Choose a valid time.';
  if (validDate && !fields.time && start <= now)
    fields.date = 'Choose an event date and time in the future.';
  if (!Number.isInteger(event.capacity) || event.capacity < 1 || event.capacity > 500)
    fields.capacity = 'Capacity must be a whole number between 1 and 500.';
  else if (event.capacity < minimumCapacity)
    fields.capacity = `At least ${minimumCapacity} students have already RSVP'd. Capacity cannot be smaller.`;
  if (event.bring.length > 10 || event.bring.some((item) => item.length > 160))
    fields.bring = 'Use up to 10 notes, each no longer than 160 characters.';
  if (Object.keys(fields).length)
    throw new AppError('Please check the highlighted fields.', 'validation', fields);
  return event;
}

export function eventHasStarted(event, now = new Date()) {
  return new Date(`${event.date}T${event.time}`) <= now;
}

/** Pure transactions enforce invariants for every view, without modifying input state. */
export function applyCommand(
  state,
  command,
  { now = new Date(), id = () => crypto.randomUUID() } = {},
) {
  if (command.type === 'REGISTER') {
    const user = { ...validateRegistration(command.values, state.users), id: id() };
    return {
      state: { ...state, users: [...state.users, user], currentUserId: user.id },
      value: publicUser(user),
    };
  }
  if (command.type === 'LOGIN') {
    const email = clean(command.email).toLowerCase();
    const fields = {};
    if (!emailPattern.test(email)) fields.email = 'Enter a valid email address.';
    if (!command.password) fields.password = 'Enter your password.';
    if (Object.keys(fields).length)
      throw new AppError('Please complete the login form.', 'validation', fields);
    const user = state.users.find(
      (user) => user.email.toLowerCase() === email && user.password === command.password,
    );
    if (!user)
      throw new AppError('Email or password is incorrect. Please try again.', 'credentials');
    return { state: { ...state, currentUserId: user.id }, value: publicUser(user) };
  }
  if (command.type === 'LOGOUT') return { state: { ...state, currentUserId: null } };

  const user = state.users.find((user) => user.id === state.currentUserId);
  if (!user) throw new AppError('Please log in to continue.', 'unauthenticated');
  if (command.type === 'CREATE_EVENT') {
    const event = { ...validateEvent(command.values, { now }), id: id(), creatorId: user.id };
    return { state: { ...state, events: [...state.events, event] }, value: event };
  }
  const event = state.events.find((event) => event.id === command.eventId);
  if (!event) throw new AppError('This event is no longer available.', 'not_found');
  const attending = state.rsvps.filter((rsvp) => rsvp.eventId === event.id);
  if (command.type === 'UPDATE_EVENT' || command.type === 'DELETE_EVENT') {
    if (event.creatorId !== user.id)
      throw new AppError('Only the creator can change this event.', 'forbidden');
    if (command.type === 'DELETE_EVENT')
      return {
        state: {
          ...state,
          events: state.events.filter((item) => item.id !== event.id),
          rsvps: state.rsvps.filter((item) => item.eventId !== event.id),
        },
      };
    const updated = {
      ...validateEvent(command.values, { now, minimumCapacity: attending.length }),
      id: event.id,
      creatorId: event.creatorId,
    };
    return {
      state: {
        ...state,
        events: state.events.map((item) => (item.id === event.id ? updated : item)),
      },
      value: updated,
    };
  }
  if (command.type === 'CANCEL_RSVP')
    return {
      state: {
        ...state,
        rsvps: state.rsvps.filter(
          (item) => !(item.userId === user.id && item.eventId === event.id),
        ),
      },
    };
  if (command.type === 'RSVP') {
    if (attending.some((rsvp) => rsvp.userId === user.id))
      throw new AppError('You have already RSVP’d to this event.', 'duplicate');
    if (eventHasStarted(event, now))
      throw new AppError('This event has already started.', 'past_event');
    if (attending.length >= event.capacity)
      throw new AppError('This event is full. Explore another event.', 'full');
    const rsvp = { id: id(), userId: user.id, eventId: event.id };
    return { state: { ...state, rsvps: [...state.rsvps, rsvp] }, value: rsvp };
  }
  throw new AppError('Unknown application action.', 'unknown_command');
}
