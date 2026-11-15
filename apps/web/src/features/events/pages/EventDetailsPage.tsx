import React from 'react';
import { useLocation, useParams } from 'react-router';
import { getErrorMessage } from '@/shared/api/client';
import { BackLink } from '@/shared/ui/back-link';
import { EventDetails } from '../components/event-details';
import { RegistrationPanel } from '../components/registration-panel';
import { StateView } from '@/shared/ui/state-view';
import { useEvent } from '../hooks/use-events';
import {
  useCancelRegistration,
  useMyRegistrations,
  useRegister
} from '@/features/tickets/hooks/use-registrations';
import { useAuth } from '@/app/providers/AuthProvider';
import { useToast } from '@/app/providers/ToastProvider';

export const EventDetailsPage = () => {
  const { id = '' } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const toast = useToast();
  const { data: event, isLoading, error, refetch } = useEvent(id);
  const isAttendee = user?.role === 'ATTENDEE';
  const { data: registrations } = useMyRegistrations(isAttendee);
  const register = useRegister();
  const cancel = useCancelRegistration();

  // The URL may hold the event id or its slug; match on the loaded event.
  const myRegistration = registrations?.find(
    (registration) =>
      registration.event.id === event?.id && registration.status === 'ACTIVE'
  );

  const handleRegister = (slotId?: string) => {
    if (!event) {
      return;
    }
    register.mutate(
      { eventId: event.id, slotId },
      {
        onSuccess: () =>
          toast.success('Registration confirmed. Your place is reserved.'),
        onError: (reason) => toast.error(getErrorMessage(reason))
      }
    );
  };

  const handleCancel = (registrationId: string) => {
    cancel.mutate(registrationId, {
      onSuccess: () =>
        toast.success('Registration canceled. Your place has been released.'),
      onError: (reason) => toast.error(getErrorMessage(reason))
    });
  };

  return (
    <>
      {/* Back to wherever the visitor came from: a filtered list, My
          tickets, the dashboard; opened directly, to Discover. */}
      <BackLink fallback="/" />
      <StateView
        isLoading={isLoading}
        loadingLabel="Loading event"
        error={error}
        onRetry={() => void refetch()}
      >
        {event ? (
          <EventDetails
            event={event}
            showStaffStatus={
              user?.role === 'ADMIN' || event.organizerId === user?.id
            }
            registrationSlot={
              <RegistrationPanel
                event={event}
                viewer={user}
                registration={myRegistration}
                onRegister={handleRegister}
                onCancelRegistration={handleCancel}
                isRegistering={register.isPending}
                isCanceling={cancel.isPending}
                signInHref={`/login?redirect=${encodeURIComponent(location.pathname)}`}
              />
            }
          />
        ) : null}
      </StateView>
    </>
  );
};
