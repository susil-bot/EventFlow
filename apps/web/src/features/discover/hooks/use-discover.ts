import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/query-keys';
import type { DiscoverFilterQuery } from '@/shared/api/types';

/**
 * Events per category for the current filters (the category filter itself
 * is ignored, so every chip shows what selecting it would add).
 */
export const useEventFacets = (query: DiscoverFilterQuery) => {
  const { categories: _ignored, ...rest } = query;
  return useQuery({
    queryKey: queryKeys.facets(rest),
    queryFn: () => eventsApi.facets(rest),
    placeholderData: keepPreviousData,
    staleTime: 30_000
  });
};
