import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { clubs } from '../data/seed.js';
import { AppError, applyCommand, createInitialState, publicUser } from '../lib/model.js';

const AppContext = createContext(null);

function initialTheme() {
  try {
    return localStorage.getItem('campus-theme') === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function AppProvider({ children }) {
  const [state, setState] = useState(createInitialState);
  const stateRef = useRef(state);
  const [theme, setTheme] = useState(initialTheme);
  const [notice, setNotice] = useState(null);
  // The ref makes sequential mock transactions atomic before React renders.
  const execute = useCallback((command) => {
    try {
      const result = applyCommand(stateRef.current, command);
      stateRef.current = result.state;
      setState(result.state);
      return { ok: true, value: result.value };
    } catch (error) {
      if (!(error instanceof AppError)) throw error;
      return { ok: false, error: error.message, fields: error.fields, code: error.code };
    }
  }, []);
  const notify = useCallback((message, tone = 'success') => setNotice({ message, tone }), []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#141e1c' : '#f9faf7');
    try {
      localStorage.setItem('campus-theme', theme);
    } catch {
      /* Optional preference storage. */
    }
  }, [theme]);
  const currentUser = publicUser(state.users.find((user) => user.id === state.currentUserId));
  return (
    <AppContext.Provider
      value={{
        clubs,
        events: state.events,
        rsvps: state.rsvps,
        currentUser,
        execute,
        notify,
        notice,
        dismissNotice: () => setNotice(null),
        theme,
        toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
