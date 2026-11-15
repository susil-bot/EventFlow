import React, { useState } from 'react';
import { getErrorMessage } from '@/shared/api/client';
import { LinkButton } from '@/shared/ui/button';
import { PageHeader } from '@/shared/ui/page-header';
import { RegistrationList } from '../components/registration-list';
import { StateView } from '@/shared/ui/state-view';
import {
  useCancelRegistration,
  useMyRegistrations
} from '../hooks/use-registrations';
import { useToast } from '@/app/providers/ToastProvider';

export const MyRegistrationsPage = () => {
  const toast = useToast();
  const { data = [], isLoading, error, refetch } = useMyRegistrations();
  const cancel = useCancelRegistration();
  const [cancelingId, setCancelingId] = useState<string>();

  const handleCancel = (registrationId: string) => {
    setCancelingId(registrationId);
    cancel.mutate(registrationId, {
      onSuccess: ({ event }) =>
        toast.success(`Registration for "${event.title}" canceled.`),
      onError: (reason) => toast.error(getErrorMessage(reason)),
      onSettled: () => setCancelingId(undefined)
    });
  };

  return (
    <>
      <PageHeader
        title="My registrations"
        description="Your upcoming events. Cancel anytime before the event starts."
      />
      <StateView
        isLoading={isLoading}
        loadingLabel="Loading your registrations"
        error={error}
        onRetry={() => void refetch()}
        isEmpty={data.length === 0}
        emptyIcon="ticket"
        emptyTitle="No upcoming registrations"
        emptyMessage="Browse upcoming events and register in one click."
        emptyAction={<LinkButton to="/">Discover events</LinkButton>}
      >
        <RegistrationList
          registrations={data}
          onCancel={handleCancel}
          cancelingId={cancelingId}
        />
      </StateView>
    </>
  );
};
