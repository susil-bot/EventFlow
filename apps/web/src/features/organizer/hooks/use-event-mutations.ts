import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, uploadsApi } from '@/shared/api/endpoints';
import type {
  CreateEventInput,
  EventDto,
  EventInput
} from '@/shared/api/types';
import { queryKeys } from '@/shared/api/query-keys';

/** Keeps every view of an event in sync after a change. */
const useSyncEvent = () => {
  const queryClient = useQueryClient();
  return (event: EventDto) => {
    queryClient.setQueryData(queryKeys.event(event.id), event);
    void queryClient.invalidateQueries({ queryKey: queryKeys.organizerEvents });
    void queryClient.invalidateQueries({ queryKey: queryKeys.publicEvents });
    // Admins manage events too.
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin });
  };
};

export const useCreateEvent = () => {
  const sync = useSyncEvent();
  return useMutation({
    mutationFn: (input: CreateEventInput) => eventsApi.create(input),
    onSuccess: sync
  });
};

export const useUpdateEvent = (id: string) => {
  const sync = useSyncEvent();
  return useMutation({
    mutationFn: (input: Partial<EventInput>) => eventsApi.update(id, input),
    onSuccess: sync
  });
};

export const usePublishEvent = () => {
  const sync = useSyncEvent();
  return useMutation({
    mutationFn: (id: string) => eventsApi.publish(id),
    onSuccess: sync
  });
};

export const useUnpublishEvent = () => {
  const sync = useSyncEvent();
  return useMutation({
    mutationFn: (id: string) => eventsApi.unpublish(id),
    onSuccess: sync
  });
};

export const useCancelEvent = () => {
  const sync = useSyncEvent();
  return useMutation({
    mutationFn: (id: string) => eventsApi.cancel(id),
    onSuccess: sync
  });
};

/** Uploads a promo image; the returned id is attached when the form saves. */
export const useUploadImage = () =>
  useMutation({ mutationFn: (file: File) => uploadsApi.uploadImage(file) });
