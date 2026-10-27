import { Link } from 'react-router';
import { categoryKey, displayDate, displayTime } from '../lib/events.js';
import Icon from './Icon.jsx';

export function EventArtwork({ event, large = false }) {
  const key = categoryKey(event.category);
  return (
    <div className={`event-art art-${key} ${large ? 'art-large' : ''}`}>
      <span className="art-category">{event.category}</span>
      <svg
        viewBox="0 0 400 240"
        role="img"
        aria-label={`${event.category} event illustration`}
        preserveAspectRatio="xMidYMid slice"
      >
        {key === 'technology' ? (
          <g fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="85" y="46" width="230" height="150" rx="15" transform="rotate(-8 200 120)" />
            <rect x="100" y="35" width="230" height="150" rx="15" transform="rotate(8 200 120)" />
            <path d="m165 100-28 24 28 24m70-48 28 24-28 24m-22-65-24 85" strokeWidth="6" />
          </g>
        ) : key === 'arts' ? (
          <g fill="currentColor">
            <circle cx="155" cy="114" r="62" opacity=".7" />
            <rect
              x="200"
              y="63"
              width="90"
              height="123"
              transform="rotate(18 245 124)"
              opacity=".9"
            />
            <circle cx="155" cy="114" r="27" className="art-cutout" />
          </g>
        ) : key === 'outdoors' ? (
          <g fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="267" cy="72" r="24" />
            <path d="m60 200 105-125 74 89 37-40 64 76Zm41 0 64-76 64 76" />
          </g>
        ) : key === 'music' ? (
          <g fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="200" cy="120" r="82" />
            <circle cx="200" cy="120" r="59" />
            <circle cx="200" cy="120" r="35" />
            <circle cx="200" cy="120" r="8" fill="currentColor" />
            <path d="M310 48v99l-22 20" strokeWidth="7" />
          </g>
        ) : key === 'business' ? (
          <g fill="none" stroke="currentColor" strokeWidth="4">
            <path d="M88 183h225M113 183v-42h37v42m32 0V99h37v84m32 0V57h37v126M100 112l70-51 53 10 69-40" />
            <path d="m267 32 25-1-5 24" />
          </g>
        ) : (
          <g fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="153" cy="100" r="37" />
            <circle cx="247" cy="100" r="37" />
            <path d="M95 193c0-65 116-65 116 0m-22 0c0-65 116-65 116 0" />
            <path d="m184 47 16 15 16-15" />
          </g>
        )}
      </svg>
      <span className="art-corner">CAMPUS / {event.date.slice(5).replace('-', '.')}</span>
    </div>
  );
}

export default function EventCard({ event, club }) {
  return (
    <article className="event-card">
      <Link
        to={`/events/${event.id}`}
        className="event-art-link"
        aria-label={`View ${event.title}`}
      >
        <EventArtwork event={event} />
        <span className="card-date">
          <strong>{displayDate(event.date, { day: '2-digit' })}</strong>
          <span>{displayDate(event.date, { month: 'short' })}</span>
        </span>
      </Link>
      <div className="card-body">
        <Link to={`/clubs/${club.id}`} className="club-byline">
          <span className={`mini-avatar art-${categoryKey(club.category)}`}>{club.initials}</span>
          {club.name}
        </Link>
        <h3>
          <Link to={`/events/${event.id}`}>{event.title}</Link>
        </h3>
        <p className="card-summary">{event.summary}</p>
        <div className="card-meta">
          <span>
            <Icon name="clock" size={15} />
            {displayTime(event.time)}
          </span>
          <span className="free-tag">Free entry</span>
        </div>
        <div className="card-location">
          <Icon name="pin" size={15} />
          <span>{event.location}</span>
        </div>
      </div>
    </article>
  );
}
