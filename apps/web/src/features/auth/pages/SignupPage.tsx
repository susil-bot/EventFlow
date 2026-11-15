import React, { type FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import {
  describeError,
  type ErrorDescription,
  getFieldErrors
} from '@/shared/api/client';
import type { FieldErrors, SignupRole } from '@/shared/api/types';
import { Button } from '@/shared/ui/button';
import { InlineAlert } from '@/shared/ui/inline-alert';
import { SelectField } from '@/shared/ui/select-field';
import { TextField } from '@/shared/ui/text-field';
import { AuthLayout } from '@/shared/ui/auth-layout';
import { useAuth } from '@/app/providers/AuthProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { homeFor } from './LoginPage';

const ROLE_OPTIONS = [
  { value: 'ATTENDEE', label: 'Attendee — discover and join events' },
  {
    value: 'ORGANIZER',
    label: 'Organizer — create and manage events (needs admin approval)'
  }
];

export const SignupPage = () => {
  const { user, signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  // "List your event" links here with ?role=ORGANIZER.
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: (params.get('role') === 'ORGANIZER'
      ? 'ORGANIZER'
      : 'ATTENDEE') as SignupRole
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [problem, setProblem] = useState<ErrorDescription>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to={homeFor(user)} replace />;
  }

  const update =
    (field: keyof typeof form) => (event: { target: { value: string } }) => {
      const { value } = event.target;
      setForm((current) => ({ ...current, [field]: value }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setProblem(undefined);
    signup(form)
      .then((created) => {
        toast.success(
          created.status === 'PENDING_APPROVAL'
            ? 'Your account has been created. You can create events once an admin approves your organizer access.'
            : 'Your account has been created.'
        );
        navigate(homeFor(created), { replace: true });
      })
      .catch((reason: unknown) => {
        // Field problems (e.g. email taken) show on the field; anything
        // else (an outage, too many attempts) in an alert above the form.
        const described = describeError(reason);
        if (described.kind === 'fields') {
          setErrors(getFieldErrors(reason));
        } else {
          setProblem(described);
        }
        setIsSubmitting(false);
      });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
        </>
      }
    >
      {problem ? (
        <InlineAlert
          tone={problem.kind === 'rate-limit' ? 'warning' : 'danger'}
          title={
            problem.kind === 'rate-limit'
              ? 'Too many attempts'
              : "We couldn't create your account"
          }
          reference={problem.reference}
        >
          {problem.message}
        </InlineAlert>
      ) : null}
      <form onSubmit={handleSubmit} aria-label="Create account" noValidate>
        <TextField
          label="Full name"
          autoComplete="name"
          value={form.name}
          onChange={update('name')}
          error={errors.name}
          required
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={update('email')}
          error={errors.email}
          required
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          value={form.password}
          onChange={update('password')}
          error={errors.password}
          required
        />
        <SelectField
          label="I want to join as"
          options={ROLE_OPTIONS}
          value={form.role}
          onChange={update('role')}
          error={errors.role}
        />
        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
};
