import { screen } from '@testing-library/react';
import React from 'react';
import { Route, Routes } from 'react-router';
import type { User } from '@/shared/api/types';
import {
  adminUser,
  attendeeUser,
  organizerUser,
  pendingOrganizerUser
} from '@/shared/test/fixtures/events';
import { SESSION_QUERY_KEY } from '../providers/AuthProvider';
import { renderWithProviders } from '@/shared/test/render';
import { RequireRole } from './RequireRole';

const renderAs = (user: User | null, allow: User['role']) => {
  const view = renderWithProviders(
    <Routes>
      <Route
        path="/private"
        element={
          <RequireRole allow={allow}>
            <p>secret page</p>
          </RequireRole>
        }
      />
      <Route path="/login" element={<p>login page</p>} />
    </Routes>,
    {
      route: '/private',
      withAuth: true,
      seed: (client) => client.setQueryData(SESSION_QUERY_KEY, user)
    }
  );
  return view;
};

describe('<RequireRole />', () => {
  it('sends signed-out visitors to the login page', () => {
    renderAs(null, 'ATTENDEE');

    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it.each([
    ['an attendee', attendeeUser, 'ORGANIZER'],
    ['an organizer', organizerUser, 'ADMIN'],
    ['an admin', adminUser, 'ATTENDEE']
  ] as const)('blocks %s from another role’s page', (_label, user, allow) => {
    renderAs(user, allow);

    expect(screen.queryByText('secret page')).not.toBeInTheDocument();
    expect(
      screen.getByText("This page isn't available for your account")
    ).toBeInTheDocument();
  });

  it('holds a pending organizer at the approval notice', () => {
    renderAs(pendingOrganizerUser, 'ORGANIZER');

    expect(screen.queryByText('secret page')).not.toBeInTheDocument();
    expect(
      screen.getByText('Your organizer account is awaiting approval')
    ).toBeInTheDocument();
  });

  it.each([
    ['ATTENDEE', attendeeUser],
    ['ORGANIZER', organizerUser],
    ['ADMIN', adminUser]
  ] as const)('lets an active %s in', (allow, user) => {
    renderAs(user, allow);

    expect(screen.getByText('secret page')).toBeInTheDocument();
  });
});
