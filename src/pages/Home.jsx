import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext.jsx';
import { categoryKey, displayDate, filterEvents } from '../lib/events.js';
import EventCard, { EventArtwork } from '../components/EventCard.jsx';
import Icon from '../components/Icon.jsx';

export default function Home() {
  const { events, clubs } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const weekEvents = filterEvents(events, { period: 'week' });
  const featured = filterEvents(events)[0];
  const featuredClub = clubs.find((c) => c.id === featured?.clubId);
  return (
    <>
      <section className="container hero grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="eyebrow">
            <span className="status-dot" /> A LITTLE MORE CAMPUS LIFE
          </p>
          <h1>
            Good company.
            <br />
            Great <span className="serif-word">experiences.</span>
          </h1>
          <p className="hero-copy">
            Discover events, explore your interests and meet the people who make campus feel like
            your place.
          </p>
          <form
            className="hero-search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/events${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
            }}
          >
            <Icon name="search" />
            <label className="sr-only" htmlFor="home-search">
              Search campus events
            </label>
            <input
              id="home-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you interested in?"
            />
            <button className="button" type="submit">
              Explore <Icon name="arrow" size={17} />
            </button>
          </form>
          <div className="hero-proof">
            <div className="avatar-stack" aria-hidden="true">
              <span>MT</span>
              <span>Z</span>
              <span>MB</span>
              <span>B</span>
            </div>
            <p>
              Find your people across <strong>{clubs.length} student clubs.</strong>
            </p>
          </div>
        </div>
        {featured && (
          <Link
            className="hero-feature"
            to={`/events/${featured.id}`}
            aria-label={`Featured event: ${featured.title}`}
          >
            <div className="hero-feature-top">
              <span className="eyebrow">ON THE CAMPUS CALENDAR</span>
              <span className="round-arrow">
                <Icon name="arrow" />
              </span>
            </div>
            <EventArtwork event={featured} large />
            <div className="hero-feature-bottom">
              <div>
                <p>{featuredClub.name}</p>
                <h2>{featured.title}</h2>
              </div>
              <span className="feature-date">
                <strong>{displayDate(featured.date, { day: '2-digit' })}</strong>
                {displayDate(featured.date, { month: 'short' })}
              </span>
            </div>
            <div className="floating-note">
              <span className="note-star">✳</span> Something new starts here.
            </div>
          </Link>
        )}
      </section>
      <section className="category-strip">
        <div className="container flex flex-wrap items-center gap-x-7 gap-y-3">
          <span className="eyebrow">MAKE TIME FOR</span>
          {['Technology', 'Arts & Culture', 'Outdoors', 'Music', 'Community'].map((category) => (
            <Link key={category} to={`/events?category=${encodeURIComponent(category)}`}>
              <span className={`category-dot art-${categoryKey(category)}`} />
              {category}
              <Icon name="arrow" size={14} />
            </Link>
          ))}
        </div>
      </section>
      <section className="container section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR NEXT PLAN</p>
            <h2>
              Happening this week<span className="count-badge">{weekEvents.length}</span>
            </h2>
          </div>
          <Link className="text-link" to="/events?period=week">
            See this week <Icon name="arrow" size={17} />
          </Link>
        </div>
        {weekEvents.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {weekEvents.slice(0, 3).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                club={clubs.find((c) => c.id === event.clubId)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Icon name="calendar" size={30} />
            <h3>A quieter week on campus</h3>
            <p>There are more events coming up. Find your next plan in the full calendar.</p>
            <Link className="button" to="/events">
              Browse upcoming events
            </Link>
          </div>
        )}
      </section>
      <section id="clubs" className="container section-block clubs-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FIND YOUR COMMUNITY</p>
            <h2>There’s a club for that.</h2>
          </div>
          <span className="muted">Different interests. Shared experiences.</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club) => (
            <Link to={`/clubs/${club.id}`} className="club-tile" key={club.id}>
              <span className={`club-avatar art-${categoryKey(club.category)}`}>
                {club.initials}
              </span>
              <div>
                <h3>{club.name}</h3>
                <p>{club.category}</p>
              </div>
              <Icon name="arrow" size={18} />
            </Link>
          ))}
        </div>
      </section>
      <section className="container community-banner">
        <div>
          <p className="eyebrow">A SPACE FOR YOU</p>
          <h2>
            The next connection
            <br />
            could be a click away.
          </h2>
          <p>Join the clubs and experiences that feel like you.</p>
        </div>
        <Link className="button button-light" to="/events">
          Find your next event <Icon name="arrow" />
        </Link>
        <span className="banner-shape" aria-hidden="true" />
      </section>
    </>
  );
}
