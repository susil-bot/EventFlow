import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { getErrorMessage } from '@/shared/api/client';
import {
  DISCOVER_BASE,
  discoverHref
} from '@/features/discover/utils/discover-url';
import { useCities } from '@/features/location/hooks/use-cities';
import { useLocationPreference } from '@/features/location/LocationProvider';
import { useAuth } from '../providers/AuthProvider';
import { useToast } from '../providers/ToastProvider';
import { CityPickerHost } from './CityPickerHost';
import { SiteHeader } from './site-header';
import { Footer, FooterInner, Main, MainInner, StyledLayout } from './styles';

/** Router layout: header, page and footer; wires auth and location state. */
export const SiteLayout = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const location = useLocationPreference();
  const { data: cities } = useCities();

  const city = cities?.find((candidate) => candidate.id === location.cityId);
  const discoverTo = discoverHref(location.cityId);
  const onDiscover = pathname.startsWith(`${DISCOVER_BASE}/`);
  const query = onDiscover ? (new URLSearchParams(search).get('q') ?? '') : '';

  const handleLogout = () => {
    logout()
      .then(() => {
        toast.info('You have been signed out.');
        navigate(discoverTo);
      })
      .catch((error: unknown) => toast.error(getErrorMessage(error)));
  };

  return (
    <StyledLayout>
      <SiteHeader
        user={user}
        cityName={city?.name ?? null}
        discoverTo={discoverTo}
        query={query}
        onSearch={(q) => navigate(discoverHref(location.cityId, { q }))}
        onChooseCity={location.openPicker}
        onLogout={handleLogout}
      />
      <Main id="main-content">
        <MainInner>
          <Outlet />
        </MainInner>
      </Main>
      <Footer>
        <FooterInner>
          <span>EventFlow</span>
          <span>Discover, host and join events near you.</span>
        </FooterInner>
      </Footer>
      <CityPickerHost />
    </StyledLayout>
  );
};
