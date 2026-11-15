import React, { type FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import {
  describeError,
  type ErrorDescription,
  getFieldErrors
} from '@/shared/api/client';
import type { FieldErrors, User } from '@/shared/api/types';
import { Button } from '@/shared/ui/button';
import { InlineAlert } from '@/shared/ui/inline-alert';
import { TextField } from '@/shared/ui/text-field';
import { AuthLayout } from '@/shared/ui/auth-layout';
import { useAuth } from '@/app/providers/AuthProvider';
import { useToast } from '@/app/providers/ToastProvider';

const DEMO_ACCOUNTS = [
  { label: 'Organizer demo', email: 'organizer@example.com' },
  { label: 'Attendee demo', email: 'attendee@example.com' },
  { label: 'Admin demo', email: 'admin@example.com' }
];
const DEMO_PASSWORD = 'Password123!';

const HOME_BY_ROLE: Record<User['role'], string> = {
  ADMIN: '/admin',
  ORGANIZER: '/organizer',
  ATTENDEE: '/'
};

export const homeFor = (user: User) => HOME_BY_ROLE[user.role];

type Credentials = { email: string; password: string };

/** Headline and tone for a sign-in failure that isn't about one field. */
const ALERT_STYLE: Partial<
  Record<
    ErrorDescription['kind'],
    { title?: string; tone: 'danger' | 'warning' }
  >
> = {
  auth: { tone: 'danger' },
  'rate-limit': { title: 'Too many attempts', tone: 'warning' },
  unavailable: { title: "We couldn't sign you in", tone: 'danger' },
  server: { title: "We couldn't sign you in", tone: 'danger' },
  network: { title: "We couldn't reach EventFlow", tone: 'danger' },
  other: { tone: 'danger' }
};

/** Outages can be retried with the same details; wrong details can't. */
const RETRYABLE = new Set<ErrorDescription['kind']>([
  'unavailable',
  'server',
  'network'
]);

/** Only allow same-app redirects to avoid open-redirects. */
const safeRedirect = (value: string | null) =>
  value?.startsWith('/') && !value.startsWith('//') ? value : null;

export const LoginPage = () => {
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = safeRedirect(params.get('redirect'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [problem, setProblem] = useState<ErrorDescription>();
  const [lastAttempt, setLastAttempt] = useState<Credentials>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to={redirect ?? homeFor(user)} replace />;
  }

  /**
   * Field problems (e.g. an invalid email) show on the field. Everything
   * else goes in one alert above the form: wrong details, too many
   * attempts, or an outage, which also gets a reference and Try again.
   */
  const signIn = (credentials: Credentials) => {
    setIsSubmitting(true);
    setFieldErrors({});
    setProblem(undefined);
    setLastAttempt(credentials);
    login(credentials.email, credentials.password)
      .then((signedIn) => {
        toast.success(`Welcome back, ${signedIn.name.split(' ')[0]}!`);
        navigate(redirect ?? homeFor(signedIn), { replace: true });
      })
      .catch((reason: unknown) => {
        const described = describeError(reason);
        if (described.kind === 'fields') {
          setFieldErrors(getFieldErrors(reason));
        } else {
          setProblem(described);
        }
        if (described.kind === 'auth') {
          setPassword('');
        }
        setIsSubmitting(false);
      });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    signIn({ email, password });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle={
        <>
          New here? <Link to="/signup">Create an account</Link>
        </>
      }
    >
      {problem ? (
        <InlineAlert
          tone={ALERT_STYLE[problem.kind]?.tone ?? 'danger'}
          title={ALERT_STYLE[problem.kind]?.title}
          reference={problem.reference}
          action={
            RETRYABLE.has(problem.kind) && lastAttempt ? (
              <Button
                variant="secondary"
                size="sm"
                isLoading={isSubmitting}
                onClick={() => signIn(lastAttempt)}
              >
                Try again
              </Button>
            ) : undefined
          }
        >
          {problem.message}
        </InlineAlert>
      ) : null}
      <form onSubmit={handleSubmit} aria-label="Sign in">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
          required
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          required
        />
        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>
      {DEMO_ACCOUNTS.map((account) => (
        <Button
          key={account.email}
          title={`Sign in as ${account.email}`}
          variant="secondary"
          fullWidth
          disabled={isSubmitting}
          onClick={() =>
            signIn({ email: account.email, password: DEMO_PASSWORD })
          }
        >
          {account.label}
        </Button>
      ))}
    </AuthLayout>
  );
};
