import React from 'react';
import { useParams } from 'react-router';
import { BackLink } from '@/shared/ui/back-link';
import { AttendeeTable } from '../components/attendee-table';
import { CapacityMeter } from '@/features/events/components/capacity-meter';
import { PageHeader } from '@/shared/ui/page-header';
import { StateView } from '@/shared/ui/state-view';
import { useEventAttendees } from '@/features/events/hooks/use-events';
import { formatEventShort } from '@/features/events/utils/event-format';

export const EventAttendeesPage = () => {
  const { id = '' } = useParams();
  const { data, isLoading, error, refetch } = useEventAttendees(id);

  return (
    <>
      <BackLink fallback="/organizer" />
      <StateView
        isLoading={isLoading}
        loadingLabel="Loading attendees"
        error={error}
        onRetry={() => void refetch()}
      >
        {data ? (
          <>
            <PageHeader
              eyebrow={`${formatEventShort(data.event)} · ${data.event.venue}`}
              title={data.event.title}
              description={
                <CapacityMeter
                  registered={data.event.registeredCount}
                  capacity={data.event.capacity}
                />
              }
            />
            <StateView
              isEmpty={data.attendees.length === 0}
              emptyIcon="users"
              emptyTitle="No registrations yet"
              emptyMessage="Attendees will appear here as soon as they register."
            >
              <AttendeeTable
                attendees={data.attendees}
                caption={`Attendees for ${data.event.title}`}
              />
            </StateView>
          </>
        ) : null}
      </StateView>
    </>
  );
};
