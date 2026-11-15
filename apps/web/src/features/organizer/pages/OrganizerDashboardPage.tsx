import React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/app/providers/AuthProvider';
import { useOrganizerEvents } from '@/features/events/hooks/use-events';
import { LinkButton } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { PageHeader } from '@/shared/ui/page-header';
import { StateView } from '@/shared/ui/state-view';
import { DashboardStats } from '../components/dashboard-stats';
import { OrganizerEventList } from '../components/organizer-event-list';

/**
 * The organizer's events with their status and places. Publishing,
 * unpublishing and canceling happen in the editor, which asks for
 * confirmation; the list only navigates.
 */
export const OrganizerDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: events = [], isLoading, error, refetch } = useOrganizerEvents();

  const addEvent = (
    <LinkButton to="/organizer/events/new">
      Add Event <Icon name="plus" size={16} />
    </LinkButton>
  );

  return (
    <>
      <PageHeader
        eyebrow={`Hello, ${user?.name.split(' ')[0] ?? 'organizer'}`}
        title="Your events"
        description="Track capacity and registrations. Open an event to edit, publish or cancel it."
        actions={addEvent}
      />
      <StateView
        isLoading={isLoading}
        loadingLabel="Loading your events"
        error={error}
        onRetry={() => void refetch()}
        isEmpty={events.length === 0}
        emptyTitle="You haven't created any events yet"
        emptyMessage="Create your first event, save it as a draft and publish when you're ready."
        emptyAction={addEvent}
      >
        <DashboardStats events={events} />
        <OrganizerEventList events={events} onNavigate={navigate} />
      </StateView>
    </>
  );
};
