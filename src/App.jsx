import { Route, Routes } from 'react-router';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Events from './pages/Events.jsx';
import EventDetails from './pages/EventDetails.jsx';
import ClubDetails from './pages/ClubDetails.jsx';
import { NotFound } from './pages/StatusPages.jsx';
import { Login, Register } from './pages/Auth.jsx';
import EventForm from './pages/EventForm.jsx';
import Dashboard from './pages/Dashboard.jsx';
import RequireAuth from './components/RequireAuth.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="events" element={<Events />} />
        <Route
          path="events/new"
          element={
            <RequireAuth>
              <EventForm />
            </RequireAuth>
          }
        />
        <Route
          path="events/:eventId/edit"
          element={
            <RequireAuth>
              <EventForm />
            </RequireAuth>
          }
        />
        <Route path="events/:eventId" element={<EventDetails />} />
        <Route path="clubs/:clubId" element={<ClubDetails />} />
        <Route
          path="dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
