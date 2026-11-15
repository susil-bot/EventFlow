import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { registrationsApi } from '@/shared/api/endpoints';
import type { RegistrationDto } from '@/shared/api/types';
import { queryKeys } from '@/shared/api/query-keys';

export const useMyRegistrations = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.myRegistrations,
    queryFn: registrationsApi.listMine,
    enabled
  });

/** After any registration change, refresh availability everywhere. */
const useSyncRegistration = () => {
  const queryClient = useQueryClient();
  return (registration: RegistrationDto) => {
    queryClient.setQueryData(
      queryKeys.event(registration.event.id),
      registration.event
    );
    // The page may have been opened by slug; refresh every event detail.
    void queryClient.invalidateQueries({ queryKey: queryKeys.eventDetails });
    void queryClient.invalidateQueries({ queryKey: queryKeys.myRegistrations });
    void queryClient.invalidateQueries({ queryKey: queryKeys.publicEvents });
  };
};

export const useRegister = () => {
  const sync = useSyncRegistration();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, slotId }: { eventId: string; slotId?: string }) =>
      registrationsApi.register(eventId, slotId),
    onSuccess: sync,
    // A conflict (full, already registered) means our copy is stale.
    onError: (_error, { eventId }) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.event(eventId) })
  });
};

export const useCancelRegistration = () => {
  const sync = useSyncRegistration();
  return useMutation({
    mutationFn: (registrationId: string) =>
      registrationsApi.cancel(registrationId),
    onSuccess: sync
  });
};
