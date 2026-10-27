import { Link, useSearchParams } from 'react-router';
import { useApp } from '../context/AppContext.jsx';
import { categories } from '../data/seed.js';
import { filterEvents } from '../lib/events.js';
import EventCard from '../components/EventCard.jsx';
import Icon from '../components/Icon.jsx';

export default function Events() {
  const { events, clubs } = useApp();
  const [params, setParams] = useSearchParams();
  const filters = Object.fromEntries(params);
  const results = filterEvents(events, filters);
  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  const hasFilters = ['q', 'club', 'category', 'period', 'date'].some((key) => params.get(key));
  return (
    <div className="container page-shell">
      <div className="page-intro">
        <p className="eyebrow">THE CAMPUS CALENDAR</p>
        <h1>
          Make room for <span className="serif-word">something new.</span>
        </h1>
        <p>Workshops, conversations and a few good reasons to get out there.</p>
      </div>
      <div className="filter-panel">
        <div className="filter-search">
          <Icon name="search" />
          <label className="sr-only" htmlFor="event-search">
            Search events
          </label>
          <input
            id="event-search"
            placeholder="Search events, interests or places"
            value={filters.q || ''}
            onChange={(e) => update('q', e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="field-label">
            Club
            <select value={filters.club || ''} onChange={(e) => update('club', e.target.value)}>
              <option value="">All clubs</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Category
            <select
              value={filters.category || ''}
              onChange={(e) => update('category', e.target.value)}
            >
              <option value="">All interests</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label className="field-label">
            When
            <select value={filters.period || ''} onChange={(e) => update('period', e.target.value)}>
              <option value="">Any time</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
            </select>
          </label>
          <label className="field-label">
            Specific date
            <input
              type="date"
              value={filters.date || ''}
              onChange={(e) => update('date', e.target.value)}
            />
          </label>
        </div>
      </div>
      <div className="results-toolbar">
        <p role="status" aria-live="polite">
          <strong>{results.length}</strong> {results.length === 1 ? 'event' : 'events'}{' '}
          {hasFilters ? `${results.length === 1 ? 'matches' : 'match'} your filters` : 'to explore'}
        </p>
        {hasFilters ? (
          <button className="text-link" onClick={() => setParams({})}>
            <Icon name="close" size={16} />
            Clear filters
          </button>
        ) : (
          <span className="muted">Soonest first</span>
        )}
      </div>
      {results.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              club={clubs.find((c) => c.id === event.clubId)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Icon name="search" size={32} />
          <h2>No events found</h2>
          <p>Try another search or clear a filter to discover more events.</p>
          <button className="button" onClick={() => setParams({})}>
            Reset all filters
          </button>
        </div>
      )}
      <Link to="/" className="text-link mt-10">
        <Icon name="back" size={16} />
        Back to Discover
      </Link>
    </div>
  );
}
