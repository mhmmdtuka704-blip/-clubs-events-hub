import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useApp } from '../context/AppContext.jsx';
import { categoryKey, displayDate, displayTime } from '../lib/events.js';
import EventCard, { EventArtwork } from '../components/EventCard.jsx';
import Icon from '../components/Icon.jsx';
import { NotFound } from './StatusPages.jsx';
import { eventHasStarted } from '../lib/model.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function EventDetails() {
  const { eventId } = useParams();
  const { events, clubs, currentUser, rsvps, execute, notify } = useApp();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const navigate = useNavigate();
  const event = events.find((e) => e.id === eventId);
  if (!event) return <NotFound entity="event" />;
  const club = clubs.find((c) => c.id === event.clubId);
  const attendeeCount = rsvps.filter((rsvp) => rsvp.eventId === event.id).length;
  const hasRsvp = rsvps.some(
    (rsvp) => rsvp.eventId === event.id && rsvp.userId === currentUser?.id,
  );
  const isOwner = currentUser?.id === event.creatorId;
  const started = eventHasStarted(event);
  const full = attendeeCount >= event.capacity;
  function changeRsvp() {
    const result = execute({ type: hasRsvp ? 'CANCEL_RSVP' : 'RSVP', eventId: event.id });
    notify(
      result.ok
        ? hasRsvp
          ? 'Your RSVP has been cancelled.'
          : 'You’re on the list. See you there!'
        : result.error,
      result.ok ? 'success' : 'error',
    );
  }
  function remove() {
    const result = execute({ type: 'DELETE_EVENT', eventId: event.id });
    setConfirmingDelete(false);
    notify(
      result.ok ? 'The event and its RSVPs have been removed.' : result.error,
      result.ok ? 'success' : 'error',
    );
    if (result.ok) navigate('/dashboard');
  }
  const related = events
    .filter(
      (e) => e.id !== event.id && (e.clubId === event.clubId || e.category === event.category),
    )
    .slice(0, 3);
  return (
    <div className="container page-shell">
      <Link className="text-link breadcrumb" to="/events">
        <Icon name="back" size={16} />
        All events
      </Link>
      <div className="detail-layout grid gap-8 lg:grid-cols-[1.65fr_1fr]">
        <div>
          <EventArtwork event={event} large />
          <div className="detail-title">
            <span className={`category-pill art-${categoryKey(event.category)}`}>
              {event.category}
            </span>
            <h1>{event.title}</h1>
            <p>{event.summary}</p>
          </div>
          <section className="prose-section">
            <h2>About this event</h2>
            <p>{event.description}</p>
            <details className="event-details-disclosure">
              <summary>What to know before you go</summary>
              <ul>
                {event.bring.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </details>
          </section>
          <section className="host-section">
            <p className="eyebrow">BROUGHT TO YOU BY</p>
            <Link className="club-tile" to={`/clubs/${club.id}`}>
              <span className={`club-avatar art-${categoryKey(club.category)}`}>
                {club.initials}
              </span>
              <div>
                <h3>{club.name}</h3>
                <p>{club.tagline}</p>
              </div>
              <Icon name="arrow" />
            </Link>
          </section>
        </div>
        <aside className="event-booking">
          <p className="eyebrow">THE DETAILS</p>
          <h2>{started ? 'A campus moment.' : 'We’ll see you there.'}</h2>
          <dl>
            <div>
              <Icon name="calendar" />
              <dt>Date</dt>
              <dd>{displayDate(event.date, { weekday: 'long', month: 'long', day: 'numeric' })}</dd>
            </div>
            <div>
              <Icon name="clock" />
              <dt>Time</dt>
              <dd>{displayTime(event.time)}</dd>
            </div>
            <div>
              <Icon name="pin" />
              <dt>Location</dt>
              <dd>{event.location}</dd>
            </div>
            <div>
              <Icon name="users" />
              <dt>Students going</dt>
              <dd>
                {attendeeCount} of {event.capacity} places
              </dd>
            </div>
          </dl>
          <div className="booking-price">
            <strong>Free</strong>
            <span>Open to campus students</span>
          </div>
          {hasRsvp ? (
            <>
              <p className="rsvp-confirmed">
                <Icon name="check" size={18} />
                You’re going to this event
              </p>
              <button className="button button-outline w-full" onClick={changeRsvp}>
                Cancel RSVP
              </button>
              <Link className="text-link booking-hub" to="/dashboard">
                View in My hub <Icon name="arrow" size={16} />
              </Link>
            </>
          ) : started || full ? (
            <button className="button w-full" disabled>
              {started ? 'This event has started' : 'All places are filled'}
            </button>
          ) : currentUser ? (
            <button className="button w-full" onClick={changeRsvp}>
              RSVP to this event <Icon name="arrow" size={18} />
            </button>
          ) : (
            <Link
              className="button w-full"
              to={`/login?returnTo=${encodeURIComponent(`/events/${event.id}`)}`}
            >
              Log in to RSVP <Icon name="arrow" size={18} />
            </Link>
          )}
          <p className="booking-note">
            {started
              ? 'Explore the calendar for more upcoming events.'
              : hasRsvp
                ? 'Plans changed? You can cancel your RSVP above.'
                : `${Math.max(0, event.capacity - attendeeCount)} places available. Join the conversation.`}
          </p>
          {isOwner && (
            <div className="owner-actions">
              <p className="eyebrow">YOU’RE HOSTING THIS EVENT</p>
              <Link className="button button-outline w-full" to={`/events/${event.id}/edit`}>
                Edit event
              </Link>
              <button className="text-link danger-text" onClick={() => setConfirmingDelete(true)}>
                Delete event
              </button>
            </div>
          )}
        </aside>
      </div>
      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this event?"
        description={`“${event.title}” and all its RSVPs will be removed. This cannot be undone in this session.`}
        confirmLabel="Delete event"
        onConfirm={remove}
        onClose={() => setConfirmingDelete(false)}
      />
      {related.length > 0 && (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <p className="eyebrow">KEEP EXPLORING</p>
              <h2>You might also like</h2>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((e) => (
              <EventCard key={e.id} event={e} club={clubs.find((c) => c.id === e.clubId)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
