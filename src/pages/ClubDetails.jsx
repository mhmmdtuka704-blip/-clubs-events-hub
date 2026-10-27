import { Link, useParams } from 'react-router';
import { useApp } from '../context/AppContext.jsx';
import { categoryKey, filterEvents } from '../lib/events.js';
import EventCard from '../components/EventCard.jsx';
import Icon from '../components/Icon.jsx';
import { NotFound } from './StatusPages.jsx';

export default function ClubDetails() {
  const { clubId } = useParams();
  const { events, clubs } = useApp();
  const club = clubs.find((c) => c.id === clubId);
  if (!club) return <NotFound entity="club" />;
  const clubEvents = filterEvents(events, { club: club.id });
  return (
    <div className="container page-shell">
      <Link className="text-link breadcrumb" to="/#clubs">
        <Icon name="back" size={16} />
        Discover clubs
      </Link>
      <section className={`club-cover art-${categoryKey(club.category)}`}>
        <span className="club-cover-pattern" aria-hidden="true" />
        <span className="eyebrow">STUDENT LED. OPEN TO YOU.</span>
        <span className="club-cover-letter" aria-hidden="true">
          {club.initials}
        </span>
      </section>
      <div className="club-profile">
        <span className={`club-avatar club-avatar-large art-${categoryKey(club.category)}`}>
          {club.initials}
        </span>
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">{club.category}</p>
            <h1>{club.name}</h1>
            <p>{club.tagline}</p>
          </div>
          <Link className="button button-outline" to={`/events?club=${club.id}`}>
            Explore club events <Icon name="arrow" size={17} />
          </Link>
        </div>
      </div>
      <div className="grid gap-10 md:grid-cols-[1.6fr_1fr] club-about">
        <section className="prose-section">
          <h2>A little about us</h2>
          <p>{club.description}</p>
        </section>
        <div className="club-facts">
          <p>
            <Icon name="users" />
            <strong>{club.members}</strong> community members
          </p>
          <p>
            <Icon name="calendar" />
            On campus since {club.founded}
          </p>
          <p>
            <Icon name="mail" />
            <span>{club.contact}</span>
          </p>
          <small>Sample club information for the Phase 1 frontend.</small>
        </div>
      </div>
      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">COME ALONG</p>
            <h2>
              Upcoming club events<span className="count-badge">{clubEvents.length}</span>
            </h2>
          </div>
        </div>
        {clubEvents.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clubEvents.map((event) => (
              <EventCard key={event.id} event={event} club={club} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>More plans are on the way</h3>
            <p>Explore what other clubs are planning in the meantime.</p>
            <Link className="button" to="/events">
              Browse all events
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
