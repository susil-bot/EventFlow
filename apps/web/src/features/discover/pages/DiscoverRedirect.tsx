import React from 'react';
import { Navigate, useSearchParams } from 'react-router';
import { useLocationPreference } from '@/features/location/LocationProvider';
import { StateView } from '@/shared/ui/state-view';
import { discoverHref, parseDiscoverSearch } from '../utils/discover-url';

/**
 * `/` and `/discover`: go to Discover for the visitor's city (once a
 * signed-in user's saved city is known), keeping any filters in the URL.
 */
export const DiscoverRedirect = () => {
  const [params] = useSearchParams();
  const { isReady, cityId } = useLocationPreference();
  if (!isReady) {
    return <StateView isLoading loadingLabel="Loading events" />;
  }
  return (
    <Navigate to={discoverHref(cityId, parseDiscoverSearch(params))} replace />
  );
};
