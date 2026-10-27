import test from 'node:test';
import assert from 'node:assert/strict';
import { filterEvents, localDate, weekRange, displayTime } from '../src/lib/events.js';
import { clubs, createSeedEvents, categories } from '../src/data/seed.js';

const monday = new Date(2026, 9, 26, 12);
const records = [
  {
    id: 'outside',
    title: 'Web Workshop',
    summary: 'Build together',
    clubId: 'tech',
    category: 'Technology',
    date: '2026-11-02',
    time: '09:00',
    location: 'Lab',
  },
  {
    id: 'match',
    title: 'Web Workshop',
    summary: 'Build together',
    clubId: 'tech',
    category: 'Technology',
    date: '2026-10-28',
    time: '17:00',
    location: 'Lab',
  },
  {
    id: 'wrong-club',
    title: 'Web Design',
    summary: 'Visual design',
    clubId: 'arts',
    category: 'Arts',
    date: '2026-10-28',
    time: '10:00',
    location: 'Studio',
  },
];

test('week boundaries use Monday through Sunday across months', () => {
  assert.deepEqual(weekRange(new Date(2026, 10, 1, 23)), {
    start: '2026-10-26',
    end: '2026-11-02',
  });
});
test('week boundaries work across calendar years', () => {
  assert.deepEqual(weekRange(new Date(2027, 0, 1)), { start: '2026-12-28', end: '2027-01-04' });
});
test('search, club, category, specific date and period intersect', () => {
  assert.deepEqual(
    filterEvents(
      records,
      { q: ' WEB ', club: 'tech', category: 'Technology', date: '2026-10-28', period: 'week' },
      monday,
    ).map((e) => e.id),
    ['match'],
  );
});
test('this week excludes next Monday', () => {
  assert.equal(filterEvents(records, { period: 'week' }, monday).length, 2);
});
test('today uses the supplied local calendar date', () => {
  assert.equal(filterEvents(records, { period: 'today' }, monday).length, 0);
  assert.equal(filterEvents(records, { period: 'today' }, new Date(2026, 9, 28)).length, 2);
});
test('reset filters restores chronological results without mutating data', () => {
  const before = records.map((e) => e.id);
  assert.deepEqual(
    filterEvents(records).map((e) => e.id),
    ['wrong-club', 'match', 'outside'],
  );
  assert.deepEqual(
    records.map((e) => e.id),
    before,
  );
});
test('no matching search returns an empty collection', () => {
  assert.deepEqual(filterEvents(records, { q: 'not-an-event' }), []);
});
test('seed data has unique IDs, valid relations, known categories and date strings', () => {
  const seed = createSeedEvents(monday);
  assert.equal(new Set(seed.map((e) => e.id)).size, seed.length);
  for (const event of seed) {
    assert.ok(clubs.some((club) => club.id === event.clubId));
    assert.ok(categories.includes(event.category));
    assert.match(event.date, /^\d{4}-\d{2}-\d{2}$/);
  }
  assert.ok(filterEvents(seed, { period: 'week' }, monday).length >= 3);
});
test('seed dates move with the demo rather than becoming stale', () => {
  assert.equal(createSeedEvents(new Date(2026, 11, 31))[0].date, '2027-01-01');
});
test('local dates and 12-hour time formatting handle boundary cases', () => {
  assert.equal(localDate(new Date(2026, 0, 2)), '2026-01-02');
  assert.equal(displayTime('00:05'), '12:05 AM');
  assert.equal(displayTime('12:00'), '12:00 PM');
  assert.equal(displayTime('17:30'), '5:30 PM');
});
