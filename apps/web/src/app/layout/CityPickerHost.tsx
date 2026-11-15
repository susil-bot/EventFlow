import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  DISCOVER_BASE,
  discoverHref,
  filtersForCity,
  parseDiscoverSearch
} from '@/features/discover/utils/discover-url';
import { CityPicker } from '@/features/location/components/city-picker';
import { useCities } from '@/features/location/hooks/use-cities';
import { useLocationPreference } from '@/features/location/LocationProvider';

/**
 * The one city picker on the site. Opens from the header, from Discover,
 * and once on a first visit (closing it then means "all cities"). On a
 * Discover page, a new city also moves the page to that city.
 */
export const CityPickerHost = () => {
  const location = useLocationPreference();
  const { data: cities = [] } = useCities();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const isFirstVisit = location.isReady && !location.hasChosen;

  const handleSelect = (cityId: string | null) => {
    location.chooseCity(cityId);
    location.closePicker();
    if (pathname.startsWith(`${DISCOVER_BASE}/`)) {
      const filters = parseDiscoverSearch(new URLSearchParams(search));
      navigate(discoverHref(cityId, filtersForCity(filters, cityId)));
    }
  };

  const handleClose = () => {
    if (!location.hasChosen) {
      location.chooseCity(null);
    }
    location.closePicker();
  };

  return (
    <CityPicker
      open={location.isPickerOpen || isFirstVisit}
      cities={cities}
      selectedCityId={location.cityId}
      onSelect={handleSelect}
      onClose={handleClose}
    />
  );
};
