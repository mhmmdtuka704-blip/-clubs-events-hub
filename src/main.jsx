import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router';
import { AppProvider } from './context/AppContext.jsx';
import App from './App.jsx';
import './styles.css';

const Router = import.meta.env.BASE_URL === '/' ? BrowserRouter : HashRouter;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <AppProvider>
        <App />
      </AppProvider>
    </Router>
  </StrictMode>,
);
