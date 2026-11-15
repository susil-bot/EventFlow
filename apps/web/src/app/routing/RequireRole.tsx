import React, { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import type { Role } from '@/shared/api/types';
import { LinkButton } from '@/shared/ui/button';
import { StateView } from '@/shared/ui/state-view';
import { useAuth } from '../providers/AuthProvider';

type RequireRoleProps = {
  /** The role allowed to see this route. */
  allow: Role;
  children: ReactNode;
};

/**
 * UX guard for private routes. It only decides what to render; the API
 * independently rejects the wrong role, inactive accounts and non-owners.
 */
export const RequireRole = ({ allow, children }: RequireRoleProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <StateView isLoading loadingLabel="Checking your session" />;
  }
  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  if (user.role !== allow) {
    return (
      <StateView
        isEmpty
        emptyIcon="alert"
        emptyTitle="This page isn't available for your account"
        emptyMessage={`This page is only available to ${allow.toLowerCase()}s. You're signed in as an ${user.role.toLowerCase()}.`}
        emptyAction={<LinkButton to="/">Go to events</LinkButton>}
      />
    );
  }
  if (user.status === 'PENDING_APPROVAL') {
    return (
      <StateView
        isEmpty
        emptyIcon="clock"
        emptyTitle="Your organizer account is awaiting approval"
        emptyMessage="An admin reviews new organizers before they can create events. You can browse events in the meantime; this page unlocks as soon as you're approved."
        emptyAction={<LinkButton to="/">Browse events</LinkButton>}
      />
    );
  }
  return <>{children}</>;
};
