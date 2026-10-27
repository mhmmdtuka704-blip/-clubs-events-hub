import { Link } from 'react-router';
import Icon from '../components/Icon.jsx';

export function NotFound({ entity = 'page' }) {
  return (
    <div className="container page-shell">
      <div className="empty-state status-page">
        <p className="eyebrow">NOT FOUND</p>
        <h1>That {entity} isn’t here.</h1>
        <p>The link may have changed. There are more experiences to discover.</p>
        <Link className="button" to="/events">
          Explore events <Icon name="arrow" />
        </Link>
      </div>
    </div>
  );
}
