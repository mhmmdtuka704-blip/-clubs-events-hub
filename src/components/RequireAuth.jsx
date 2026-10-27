import { Navigate, useLocation } from 'react-router';
import { useApp } from '../context/AppContext.jsx';

export default function RequireAuth({ children }) {
  const { currentUser } = useApp();
  const location = useLocation();
  if (!currentUser)
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  return children;
}
