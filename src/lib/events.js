/** Calendar dates stay local: converting to UTC can move events to the wrong day. */
export function localDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function weekRange(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start: localDate(start), end: localDate(end) };
}

export function filterEvents(events, filters = {}, now = new Date()) {
  const q = (filters.q || '').trim().toLowerCase();
  const week = weekRange(now);
  return events
    .filter(
      (event) =>
        (!q || `${event.title} ${event.summary} ${event.location}`.toLowerCase().includes(q)) &&
        (!filters.club || event.clubId === filters.club) &&
        (!filters.category || event.category === filters.category) &&
        (!filters.date || event.date === filters.date) &&
        (filters.period !== 'week' || (event.date >= week.start && event.date < week.end)) &&
        (filters.period !== 'today' || event.date === localDate(now)),
    )
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
}

export function displayDate(iso, options = { weekday: 'short', month: 'short', day: 'numeric' }) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', options);
}

export function displayTime(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
}

export function categoryKey(category = '') {
  return (
    {
      Technology: 'technology',
      'Arts & Culture': 'arts',
      Outdoors: 'outdoors',
      Entrepreneurship: 'business',
      Music: 'music',
      Community: 'community',
    }[category] || 'technology'
  );
}
