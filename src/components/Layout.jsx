import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext.jsx';
import Icon from './Icon.jsx';

export default function Layout() {
  const { theme, toggleTheme, currentUser, execute, notify, notice, dismissNotice } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const previousPath = useRef(location.pathname);
  useEffect(() => {
    setMenuOpen(false);
    const anchor = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    if (anchor) anchor.scrollIntoView({ behavior: 'instant' });
    else window.scrollTo({ top: 0, behavior: 'instant' });
    if (previousPath.current !== location.pathname)
      document.getElementById('main')?.focus({ preventScroll: true });
    previousPath.current = location.pathname;
    const heading = document.querySelector('main h1')?.innerText?.replace(/\s+/g, ' ').trim();
    document.title = heading ? `${heading} | Campus` : 'Clubs & Events Hub';
  }, [location.pathname, location.hash]);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menuOpen]);
  const logout = () => {
    execute({ type: 'LOGOUT' });
    setMenuOpen(false);
    notify('You have been logged out.');
    navigate('/');
  };
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand" aria-label="Clubs and Events Hub home">
            <span className="brand-symbol">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span>
              campus<span className="brand-dot">.</span>
              <small>CLUBS & EVENTS HUB</small>
            </span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <NavLink to="/" end>
              Discover
            </NavLink>
            <NavLink to="/events">All events</NavLink>
            <NavLink to="/dashboard">My hub</NavLink>
          </nav>
          <div className="header-actions">
            <button
              className="icon-button"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              onClick={toggleTheme}
            >
              <Icon name={theme === 'light' ? 'moon' : 'sun'} />
            </button>
            {currentUser ? (
              <>
                <Link to="/dashboard" className="user-chip">
                  <span>
                    {currentUser.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)}
                  </span>
                  <span className="user-chip-name">{currentUser.name.split(' ')[0]}</span>
                </Link>
                <button className="logout-button" onClick={logout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="login-link">
                  Log in
                </Link>
                <Link to="/register" className="button button-small desktop-join">
                  Join the community <Icon name="arrow" size={16} />
                </Link>
              </>
            )}
            <button
              className="icon-button mobile-toggle"
              aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Icon name={menuOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav id="mobile-nav" className="mobile-nav container" aria-label="Mobile navigation">
            <NavLink to="/" end>
              Discover
            </NavLink>
            <NavLink to="/events">All events</NavLink>
            <NavLink to="/dashboard">My hub</NavLink>
            {currentUser ? (
              <NavLink to="/events/new">Create an event</NavLink>
            ) : (
              <>
                <NavLink to="/login">Log in</NavLink>
                <NavLink to="/register">Join the community</NavLink>
              </>
            )}
          </nav>
        )}
      </header>
      <main id="main" tabIndex="-1">
        <Outlet />
      </main>
      {notice && (
        <div
          className={`toast toast-${notice.tone}`}
          role={notice.tone === 'error' ? 'alert' : 'status'}
        >
          <Icon name={notice.tone === 'error' ? 'close' : 'check'} size={20} />
          <p>{notice.message}</p>
          <button className="icon-button" onClick={dismissNotice} aria-label="Dismiss notification">
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      <footer className="site-footer">
        <div className="container flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="footer-brand">
            campus<span>.</span>
          </Link>
          <p>A place for your interests. A community to share them.</p>
          <span className="footer-credit">Async Await · CSC443</span>
        </div>
      </footer>
    </>
  );
}
