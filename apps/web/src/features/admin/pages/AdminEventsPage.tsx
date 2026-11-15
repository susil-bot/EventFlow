import React, { useState } from 'react';
import { getErrorMessage } from '@/shared/api/client';
import type { EventStatus } from '@/shared/api/types';
import { SelectField } from '@/shared/ui/select-field';
import { AdminEventTable } from '../components/admin-event-table';
import { PageHeader } from '@/shared/ui/page-header';
import { StateView } from '@/shared/ui/state-view';
import { useAdminCancelEvent, useAdminEvents } from '../hooks/use-admin';
import { useToast } from '@/app/providers/ToastProvider';
import { STATUS_LABEL } from '@/features/events/utils/event-format';
import { Filters } from './styles';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...(['PUBLISHED', 'DRAFT', 'CANCELED'] as EventStatus[]).map((status) => ({
    value: status,
    label: STATUS_LABEL[status]
  }))
];

export const AdminEventsPage = () => {
  const toast = useToast();
  const [status, setStatus] = useState<EventStatus>();
  const events = useAdminEvents(status);
  const cancel = useAdminCancelEvent();
  const [cancelingId, setCancelingId] = useState<string>();

  const handleCancel = (eventId: string, reason: string) => {
    setCancelingId(eventId);
    cancel.mutate(
      { eventId, reason },
      {
        onSuccess: (event) =>
          toast.success(`"${event.title}" has been canceled.`),
        onError: (error) => toast.error(getErrorMessage(error)),
        onSettled: () => setCancelingId(undefined)
      }
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="All events"
        description="Every event on the platform, drafts included. Open any event to edit, publish or unpublish it, or cancel one that breaks the rules (attendees see your reason). Every action is recorded in the audit log."
      />
      <Filters as="div" aria-label="Filter events">
        <SelectField
          label="Status"
          options={STATUS_OPTIONS}
          value={status ?? ''}
          onChange={(event) =>
            setStatus((event.target.value || undefined) as EventStatus)
          }
        />
      </Filters>
      <StateView
        isLoading={events.isLoading}
        loadingLabel="Loading events"
        error={events.error}
        onRetry={() => void events.refetch()}
        isEmpty={events.data?.length === 0}
        emptyTitle="No events match this filter"
      >
        <AdminEventTable
          events={events.data ?? []}
          onCancel={handleCancel}
          cancelingId={cancelingId}
        />
      </StateView>
    </>
  );
};
