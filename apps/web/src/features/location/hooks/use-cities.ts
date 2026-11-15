import { useQuery } from '@tanstack/react-query';
import { citiesApi } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/query-keys';

/** Supported cities with event counts. Changes rarely, so cache it. */
export const useCities = () =>
  useQuery({
    queryKey: queryKeys.cities,
    queryFn: citiesApi.list,
    staleTime: 5 * 60_000
  });
