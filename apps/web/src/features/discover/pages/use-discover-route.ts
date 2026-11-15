import { useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useCities } from '@/features/location/hooks/use-cities';
import { useLocationPreference } from '@/features/location/LocationProvider';
import {
  discoverHref,
  type DiscoverFilters,
  parseCitySegment,
  parseDiscoverSearch
} from '../utils/discover-url';

/**
 * Discover's state, read from the URL: the city from the path and the
 * filters from the query string. `update` writes a new URL (and so a new
 * history entry), which makes filters shareable and back-button friendly.
 */
export const useDiscoverRoute = () => {
  const { segment } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocationPreference();
  const { data: cities, isSuccess: citiesLoaded } = useCities();

  const cityId = parseCitySegment(segment);
  const filters = useMemo(() => parseDiscoverSearch(params), [params]);
  const city = cities?.find((candidate) => candidate.id === cityId) ?? null;
  // A malformed path or a city we don't support goes to "all cities".
  const isUnknownCity =
    cityId === undefined || (citiesLoaded && cityId !== null && !city);

  // The city in the URL becomes the visitor's current city, so the header
  // and the next visit agree with what is on screen. "All cities" from a
  // plain link doesn't count as a choice on a first visit (they're asked).
  const { isReady, hasChosen, cityId: savedCityId, chooseCity } = location;
  useEffect(() => {
    if (!isReady || isUnknownCity || cityId === undefined) {
      return;
    }
    if (cityId !== savedCityId && (cityId !== null || hasChosen)) {
      chooseCity(cityId);
    }
  }, [isReady, isUnknownCity, cityId, savedCityId, hasChosen, chooseCity]);

  const update = (changes: Partial<DiscoverFilters>) =>
    navigate(discoverHref(cityId ?? null, { ...filters, page: 1, ...changes }));

  return {
    cityId: cityId ?? null,
    city,
    filters,
    isUnknownCity,
    update,
    openCityPicker: location.openPicker
  };
};
