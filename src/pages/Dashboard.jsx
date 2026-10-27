import { useState } from 'react';
import { Link } from 'react-router';
import { useApp } from '../context/AppContext.jsx';
import { categoryKey, displayDate, displayTime, filterEvents } from '../lib/events.js';
import { eventHasStarted } from '../lib/model.js';
import { EventArtwork } from '../components/EventCard.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Icon from '../components/Icon.jsx';

export default function Dashboard() {
  const { currentUser, events, clubs, rsvps, execute, notify } = useApp();
  const [tab, setTab] = useState('rsvps');
  const [deleting, setDeleting] = useState(null);
  const myRsvps = rsvps.filter((rsvp) => rsvp.userId === currentUser.id);
  const attendingIds = new Set(myRsvps.map((rsvp) => rsvp.eventId));
  const attending = filterEvents(events.filter((event) => attendingIds.has(event.id)));
  const created = filterEvents(events.filter((event) => event.creatorId === currentUser.id));
  const displayed = tab === 'rsvps' ? attending : created;
  const upcoming = attending.filter((event) => !eventHasStarted(event));
  function cancel(event) {
    const result = execute({ type: 'CANCEL_RSVP', eventId: event.id });
    notify(
      result.ok ? 'Your RSVP has been cancelled.' : result.error,
      result.ok ? 'success' : 'error',
    );
  }
  function remove() {
    const result = execute({ type: 'DELETE_EVENT', eventId: deleting.id });
    setDeleting(null);
    notify(
      result.ok ? 'The event and its RSVPs have been removed.' : result.error,
      result.ok ? 'success' : 'error',
    );
  }
  function tabKey(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === 'Home'
        ? 'rsvps'
        : event.key === 'End'
          ? 'created'
          : tab === 'rsvps'
            ? 'created'
            : 'rsvps';
    setTab(next);
    document.getElementById(`tab-${next}`)?.focus();
  }
  return (
    <div className="container page-shell dashboard-shell">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">YOUR CAMPUS, YOUR PLANS</p>
          <h1>
            Hello, <span className="serif-word">{currentUser.name.split(' ')[0]}.</span>
          </h1>
          <p>Here’s what’s on your campus calendar.</p>
        </div>
        <Link className="button" to="/events/new">
          <Icon name="plus" size={18} />
          Create an event
        </Link>
      </div>
      <div className="dashboard-stats grid gap-4 sm:grid-cols-3">
        <div>
          <Icon name="calendar" />
          <strong>{upcoming.length}</strong>
          <span>Upcoming RSVPs</span>
        </div>
        <div>
          <Icon name="users" />
          <strong>{created.length}</strong>
          <span>Events you’re hosting</span>
        </div>
        <div>
          <Icon name="clock" />
          <strong className="next-date">
            {upcoming[0]
              ? displayDate(upcoming[0].date, { month: 'short', day: 'numeric' })
              : 'Make a plan'}
          </strong>
          <span>{upcoming[0] ? 'Your next campus event' : 'Explore something new'}</span>
        </div>
      </div>
      <div className="dashboard-tabs" role="tablist" aria-label="Your events">
        <button
          id="tab-rsvps"
          role="tab"
          aria-selected={tab === 'rsvps'}
          aria-controls="hub-panel"
          tabIndex={tab === 'rsvps' ? 0 : -1}
          onKeyDown={tabKey}
          onClick={() => setTab('rsvps')}
        >
          My RSVPs <span>{attending.length}</span>
        </button>
        <button
          id="tab-created"
          role="tab"
          aria-selected={tab === 'created'}
          aria-controls="hub-panel"
          tabIndex={tab === 'created' ? 0 : -1}
          onKeyDown={tabKey}
          onClick={() => setTab('created')}
        >
          My events <span>{created.length}</span>
        </button>
      </div>
      <section id="hub-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={0}>
        {displayed.length ? (
          <div className="dashboard-list">
            {displayed.map((event) => {
              const club = clubs.find((club) => club.id === event.clubId);
              return (
                <article className="dashboard-event" key={event.id}>
                  <Link
                    className="dashboard-art"
                    to={`/events/${event.id}`}
                    aria-label={`View ${event.title}`}
                  >
                    <EventArtwork event={event} />
                  </Link>
                  <div className="dashboard-event-info">
                    <span className={`category-pill art-${categoryKey(event.category)}`}>
                      {club.name}
                    </span>
                    <h2>
                      <Link to={`/events/${event.id}`}>{event.title}</Link>
                    </h2>
                    <p>
                      <Icon name="calendar" size={15} />
                      {displayDate(event.date)}
                      <span>·</span>
                      {displayTime(event.time)}
                    </p>
                    <p>
                      <Icon name="pin" size={15} />
                      {event.location}
                    </p>
                    {eventHasStarted(event) && (
                      <small className="muted">This event has started.</small>
                    )}
                  </div>
                  <div className="dashboard-row-actions">
                    <Link className="button button-outline button-small" to={`/events/${event.id}`}>
                      View event
                    </Link>
                    {tab === 'created' ? (
                      <>
                        <Link className="text-link" to={`/events/${event.id}/edit`}>
                          Edit event
                        </Link>
                        <button
                          className="text-link danger-text"
                          aria-label={`Delete ${event.title}`}
                          onClick={() => setDeleting(event)}
                        >
                          Delete event
                        </button>
                      </>
                    ) : (
                      <button
                        className="text-link danger-text"
                        aria-label={`Cancel RSVP for ${event.title}`}
                        onClick={() => cancel(event)}
                      >
                        Cancel RSVP
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state hub-empty">
            <Icon name={tab === 'rsvps' ? 'calendar' : 'plus'} size={34} />
            <h2>
              {tab === 'rsvps' ? 'Your next plan is waiting.' : 'Bring your first event to life.'}
            </h2>
            <p>
              {tab === 'rsvps'
                ? 'When you RSVP to an event, you’ll find it right here.'
                : 'Create an event and give your community something to look forward to.'}
            </p>
            <Link className="button" to={tab === 'rsvps' ? '/events' : '/events/new'}>
              {tab === 'rsvps' ? 'Explore events' : 'Create an event'}
              <Icon name="arrow" size={17} />
            </Link>
          </div>
        )}
      </section>
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this event?"
        description={
          deleting
            ? `“${deleting.title}” will be removed from the calendar, along with every RSVP. This cannot be undone in this session.`
            : ''
        }
        confirmLabel="Delete event"
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
