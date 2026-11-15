import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { eventsApi, organizerApi } from '@/shared/api/endpoints';
import type { DiscoverQuery } from '@/shared/api/types';
import { queryKeys } from '@/shared/api/query-keys';

/** Filtered public listing; keeps the previous page on screen while loading. */
export const usePublicEvents = (query: DiscoverQuery) =>
  useQuery({
    queryKey: queryKeys.discover(query),
    queryFn: () => eventsApi.listPublic(query),
    placeholderData: keepPreviousData
  });

export const useEvent = (id: string) =>
  useQuery({ queryKey: queryKeys.event(id), queryFn: () => eventsApi.get(id) });

export const useOrganizerEvents = () =>
  useQuery({
    queryKey: queryKeys.organizerEvents,
    queryFn: organizerApi.listEvents
  });

export const useEventAttendees = (id: string) =>
  useQuery({
    queryKey: queryKeys.attendees(id),
    queryFn: () => organizerApi.listAttendees(id)
  });
