import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useApp } from '../context/AppContext.jsx';
import { categories } from '../data/seed.js';
import { localDate } from '../lib/events.js';
import FormField, { focusInvalid } from '../components/FormField.jsx';
import Icon from '../components/Icon.jsx';
import { NotFound } from './StatusPages.jsx';

export default function EventForm() {
  const { eventId } = useParams();
  const { events, currentUser } = useApp();
  const event = events.find((item) => item.id === eventId);
  if (eventId && !event) return <NotFound entity="event" />;
  if (event && event.creatorId !== currentUser.id)
    return (
      <div className="container page-shell">
        <div className="empty-state">
          <h1>This event belongs to another creator.</h1>
          <p>You can view the event or create one of your own.</p>
          <Link className="button" to={`/events/${event.id}`}>
            View event
          </Link>
        </div>
      </div>
    );
  return <EventEditor key={eventId || 'new'} event={event} />;
}

function EventEditor({ event }) {
  const { clubs, execute, notify } = useApp();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [values, setValues] = useState(
    event
      ? { ...event, bring: event.bring.join('\n') }
      : {
          title: '',
          summary: '',
          description: '',
          clubId: '',
          category: '',
          location: '',
          date: '',
          time: '',
          capacity: '30',
          bring: '',
        },
  );
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const field = (name) => ({
    value: values[name],
    onChange: (change) => {
      setValues((previous) => ({ ...previous, [name]: change.target.value }));
      setErrors((previous) => ({ ...previous, [name]: undefined }));
      setError('');
    },
    error: errors[name],
  });
  function submit(submitEvent) {
    submitEvent.preventDefault();
    const result = execute({
      type: event ? 'UPDATE_EVENT' : 'CREATE_EVENT',
      eventId: event?.id,
      values,
    });
    if (!result.ok) {
      setErrors(result.fields || {});
      setError(result.error);
      focusInvalid(formRef.current);
      return;
    }
    notify(event ? 'Your event has been updated.' : 'Your event is on the campus calendar!');
    navigate(`/events/${result.value.id}`);
  }
  return (
    <div className="container page-shell editor-shell">
      <Link className="text-link breadcrumb" to="/dashboard">
        <Icon name="back" size={16} />
        My hub
      </Link>
      <div className="page-intro">
        <p className="eyebrow">BRING PEOPLE TOGETHER</p>
        <h1>
          {event ? (
            'Give your plan an update.'
          ) : (
            <>
              Make something <span className="serif-word">happen.</span>
            </>
          )}
        </h1>
        <p>
          {event
            ? 'Keep your community up to date with the latest details.'
            : 'A workshop, a conversation or a new experience. Start with the details.'}
        </p>
      </div>
      <div className="editor-layout grid gap-7 lg:grid-cols-[1fr_280px]">
        <form className="editor-card" ref={formRef} onSubmit={submit} noValidate>
          {error && (
            <div className="form-alert" role="alert">
              {error}
            </div>
          )}
          <section>
            <h2>The essentials</h2>
            <p className="section-helper">Required fields are marked with an asterisk.</p>
            <FormField
              name="title"
              label="Event title *"
              maxLength={100}
              placeholder="An idea people will want to be part of"
              required
              {...field('title')}
            />
            <FormField
              name="summary"
              label="Short summary *"
              maxLength={160}
              placeholder="Tell people what makes this event worth joining"
              hint={`${values.summary.length}/160 characters`}
              required
              {...field('summary')}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                name="clubId"
                label="Hosting club *"
                as="select"
                required
                {...field('clubId')}
              >
                <option value="">Select a club</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </FormField>
              <FormField
                name="category"
                label="Category *"
                as="select"
                required
                {...field('category')}
              >
                <option value="">Select an interest</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </FormField>
            </div>
            <FormField
              name="description"
              label="About the event *"
              as="textarea"
              rows={5}
              maxLength={4000}
              placeholder="What will happen, and who is this event for?"
              required
              {...field('description')}
            />
          </section>
          <section>
            <h2>When and where</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                name="date"
                label="Date *"
                type="date"
                min={localDate(new Date())}
                required
                {...field('date')}
              />
              <FormField name="time" label="Time *" type="time" required {...field('time')} />
            </div>
            <FormField
              name="location"
              label="Location *"
              maxLength={120}
              placeholder="Building, room or meeting point"
              required
              {...field('location')}
            />
            <FormField
              name="capacity"
              label="Student capacity *"
              type="number"
              min={1}
              max={500}
              step={1}
              required
              {...field('capacity')}
            />
          </section>
          <section>
            <h2>A little extra information</h2>
            <FormField
              name="bring"
              label="What should students know?"
              as="textarea"
              rows={3}
              maxLength={1700}
              hint="Optional. Add one note per line, up to 10 notes."
              placeholder="Bring your laptop and charger\nNo experience needed"
              {...field('bring')}
            />
          </section>
          <div className="editor-actions">
            <Link
              className="button button-outline"
              to={event ? `/events/${event.id}` : '/dashboard'}
            >
              Cancel
            </Link>
            <button className="button" type="submit">
              {event ? 'Save changes' : 'Publish event'}
              <Icon name="arrow" size={17} />
            </button>
          </div>
        </form>
        <aside className="editor-guide">
          <span className="guide-icon">
            <Icon name="calendar" size={25} />
          </span>
          <h2>A good invitation starts with clear details.</h2>
          <p>
            Choose a title people understand, describe what to expect and double-check the location
            and time.
          </p>
          <ul>
            <li>All campus events are free.</li>
            <li>Changes appear across the calendar.</li>
            <li>You can edit or delete your own events from My hub.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
