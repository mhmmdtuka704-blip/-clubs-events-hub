import { useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { useApp } from '../context/AppContext.jsx';
import { DEMO_ACCOUNTS } from '../lib/model.js';
import { safeReturnTo } from '../lib/navigation.js';
import FormField, { focusInvalid } from '../components/FormField.jsx';
import Icon from '../components/Icon.jsx';

function AuthForm({ register }) {
  const { currentUser, execute, notify } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [visiblePassword, setVisiblePassword] = useState(false);
  const returnTo = safeReturnTo(params.get('returnTo'));
  const switchUrl = `/${register ? 'login' : 'register'}?returnTo=${encodeURIComponent(returnTo)}`;
  if (currentUser) return <Navigate to={returnTo} replace />;
  const field = (name) => ({
    value: values[name],
    onChange: (event) => {
      setValues((previous) => ({ ...previous, [name]: event.target.value }));
      setErrors((previous) => ({ ...previous, [name]: undefined }));
      setError('');
    },
    error: errors[name],
  });
  function submit(event) {
    event.preventDefault();
    const result = execute(
      register
        ? { type: 'REGISTER', values }
        : { type: 'LOGIN', email: values.email, password: values.password },
    );
    if (!result.ok) {
      setErrors(result.fields || {});
      setError(result.error);
      focusInvalid(formRef.current);
      return;
    }
    notify(
      register
        ? 'Your account is ready. Welcome to campus!'
        : `Welcome back, ${result.value.name.split(' ')[0]}.`,
    );
    navigate(returnTo, { replace: true });
  }
  return (
    <div className="container auth-shell grid gap-10 lg:grid-cols-2">
      <section className="auth-story">
        <p className="eyebrow">MORE THAN A CAMPUS CALENDAR</p>
        <h1>
          {register ? (
            <>
              Find your people.
              <br />
              Make it <span className="serif-word">your campus.</span>
            </>
          ) : (
            <>
              Your next plan
              <br />
              starts <span className="serif-word">right here.</span>
            </>
          )}
        </h1>
        <p>
          Discover a new interest, join a conversation and make room for experiences beyond the
          classroom.
        </p>
        <div className="auth-story-art" aria-hidden="true">
          <span className="story-orbit orbit-one" />
          <span className="story-orbit orbit-two" />
          <span className="story-orbit orbit-three" />
          <span className="story-center">c.</span>
          <span className="story-label">A COMMUNITY TO COME BACK TO</span>
        </div>
        <Link className="text-link" to="/events">
          Explore events first <Icon name="arrow" size={17} />
        </Link>
      </section>
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="eyebrow">{register ? 'JOIN THE COMMUNITY' : 'WELCOME BACK'}</p>
        <h2 id="auth-title">{register ? 'Create your account' : 'Log in to your campus'}</h2>
        <p className="auth-subtitle">
          {register
            ? 'A few details, and you’re ready to explore.'
            : 'Your events, your clubs and your next connection.'}
        </p>
        <form ref={formRef} onSubmit={submit} noValidate>
          {error && (
            <div className="form-alert" role="alert">
              {error}
            </div>
          )}
          {register && (
            <FormField
              name="name"
              label="Your name"
              autoComplete="name"
              required
              maxLength={60}
              placeholder="Alex Morgan"
              {...field('name')}
            />
          )}
          <FormField
            name="email"
            label="Email address"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="you@example.com"
            {...field('email')}
          />
          <div className="password-field">
            <FormField
              name="password"
              label="Password"
              type={visiblePassword ? 'text' : 'password'}
              autoComplete={register ? 'new-password' : 'current-password'}
              required
              maxLength={128}
              hint={
                register ? 'At least 8 characters, including a letter and a number.' : undefined
              }
              {...field('password')}
            />
            <button
              type="button"
              className="password-toggle"
              aria-label={visiblePassword ? 'Hide password' : 'Show password'}
              aria-pressed={visiblePassword}
              onClick={() => setVisiblePassword((value) => !value)}
            >
              {visiblePassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {register && (
            <FormField
              name="confirmPassword"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              required
              maxLength={128}
              {...field('confirmPassword')}
            />
          )}
          <button className="button w-full auth-submit" type="submit">
            {register ? 'Create account' : 'Log in'}
            <Icon name="arrow" size={17} />
          </button>
        </form>
        <p className="auth-switch">
          {register ? 'Already part of the community?' : 'New around here?'}{' '}
          <Link to={switchUrl}>{register ? 'Log in' : 'Create an account'}</Link>
        </p>
        {!register && (
          <div className="demo-accounts">
            <p className="eyebrow">TRY A DEMO ACCOUNT</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  className="demo-button"
                  onClick={() => {
                    setValues({ ...values, email: account.email, password: account.password });
                    setError('');
                    setErrors({});
                  }}
                >
                  Use {account.name.split(' ')[0]}’s account
                </button>
              ))}
            </div>
            <p>
              Password for both: <code>Campus2026!</code>
            </p>
          </div>
        )}
        <p className="demo-notice">
          Phase 1 demo: accounts and event changes reset on refresh. Use a sample password, not a
          real one.
        </p>
      </section>
    </div>
  );
}

export function Login() {
  return <AuthForm key="login" register={false} />;
}
export function Register() {
  return <AuthForm key="register" register />;
}
