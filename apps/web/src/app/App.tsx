import React from 'react';
import { Route, Routes } from 'react-router';
import { AdminEventsPage } from '@/features/admin/pages/AdminEventsPage';
import { AdminOverviewPage } from '@/features/admin/pages/AdminOverviewPage';
import { AdminUsersPage } from '@/features/admin/pages/AdminUsersPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { SignupPage } from '@/features/auth/pages/SignupPage';
import { MyRegistrationsPage } from '@/features/tickets/pages/MyRegistrationsPage';
import { EventDetailsPage } from '@/features/events/pages/EventDetailsPage';
import { DiscoverPage } from '@/features/discover/pages/DiscoverPage';
import { DiscoverRedirect } from '@/features/discover/pages/DiscoverRedirect';
import { NotFoundPage } from './NotFoundPage';
import { EventAttendeesPage } from '@/features/organizer/pages/EventAttendeesPage';
import { EventEditorPage } from '@/features/organizer/pages/EventEditorPage';
import { OrganizerDashboardPage } from '@/features/organizer/pages/OrganizerDashboardPage';
import { SiteLayout } from './layout/SiteLayout';
import { RequireRole } from './routing/RequireRole';

const organizer = (page: React.ReactNode) => (
  <RequireRole allow="ORGANIZER">{page}</RequireRole>
);

const admin = (page: React.ReactNode) => (
  <RequireRole allow="ADMIN">{page}</RequireRole>
);

export const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route element={<SiteLayout />}>
      <Route index element={<DiscoverRedirect />} />
      <Route path="/discover" element={<DiscoverRedirect />} />
      <Route path="/discover/:segment" element={<DiscoverPage />} />
      <Route path="/events/:id" element={<EventDetailsPage />} />
      <Route
        path="/my/registrations"
        element={
          <RequireRole allow="ATTENDEE">
            <MyRegistrationsPage />
          </RequireRole>
        }
      />
      <Route
        path="/organizer"
        element={organizer(<OrganizerDashboardPage />)}
      />
      <Route
        path="/organizer/events/new"
        element={organizer(<EventEditorPage />)}
      />
      <Route
        path="/organizer/events/:id/edit"
        element={organizer(<EventEditorPage />)}
      />
      <Route
        path="/organizer/events/:id/attendees"
        element={organizer(<EventAttendeesPage />)}
      />
      <Route path="/admin" element={admin(<AdminOverviewPage />)} />
      <Route path="/admin/users" element={admin(<AdminUsersPage />)} />
      <Route path="/admin/events" element={admin(<AdminEventsPage />)} />
      <Route
        path="/admin/events/:id/edit"
        element={admin(<EventEditorPage />)}
      />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);
