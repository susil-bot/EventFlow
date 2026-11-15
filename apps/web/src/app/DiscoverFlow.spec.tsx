import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useLocation } from 'react-router';
import type * as endpoints from '@/shared/api/endpoints';
import { authApi, citiesApi, eventsApi } from '@/shared/api/endpoints';
import { LOCATION_STORAGE_KEY } from '@/features/location/LocationProvider';
import { cities } from '@/shared/test/fixtures/cities';
import { makeEvent } from '@/shared/test/fixtures/events';
import { renderWithProviders } from '@/shared/test/render';
import { App } from './App';

vi.mock('@/shared/api/endpoints', async (importOriginal) => {
  const actual = await importOriginal<typeof endpoints>();
  return {
    ...actual,
    authApi: { ...actual.authApi, session: vi.fn(), setHomeCity: vi.fn() },
    citiesApi: { list: vi.fn() },
    eventsApi: { ...actual.eventsApi, listPublic: vi.fn(), facets: vi.fn() }
  };
});

const listPublic = vi.mocked(eventsApi.listPublic);

/** Shows the current URL so tests can assert on it. */
const UrlProbe = () => {
  const { pathname, search } = useLocation();
  return <output data-testid="url">{`${pathname}${search}`}</output>;
};

const url = () => screen.getByTestId('url').textContent;

const renderApp = (route: string) =>
  renderWithProviders(
    <>
      <App />
      <UrlProbe />
    </>,
    { route, withAuth: true }
  );

const saveCity = (cityId: string | null) =>
  window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({ cityId }));

beforeEach(() => {
  window.localStorage.clear();
  vi.mocked(authApi.session).mockResolvedValue(null);
  vi.mocked(citiesApi.list).mockResolvedValue(cities);
  vi.mocked(eventsApi.facets).mockResolvedValue({
    categories: [
      { category: 'WORKSHOP', count: 2 },
      { category: 'MUSIC_SHOW', count: 1 }
    ],
    total: 3
  });
  listPublic.mockResolvedValue({
    items: [makeEvent({ price: { amountMinor: 39_900, currency: 'INR' } })],
    total: 1,
    limit: 12,
    offset: 0
  });
});

describe('Discover', () => {
  it('asks for a city on the first visit and moves to that city', async () => {
    renderApp('/');

    await waitFor(() => expect(url()).toBe('/discover/events'));
    const picker = await screen.findByRole('dialog', {
      name: 'Choose your city'
    });
    await userEvent.click(
      await within(picker).findByRole('button', { name: /Chennai/ })
    );

    await waitFor(() => expect(url()).toBe('/discover/events-chennai'));
    expect(
      await screen.findByRole('heading', { name: 'Events in Chennai' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Change city (now: Chennai)' })
    ).toBeInTheDocument();
    expect(listPublic).toHaveBeenLastCalledWith(
      expect.objectContaining({ city: 'chennai' })
    );
    expect(screen.getByText('₹399')).toBeInTheDocument();
  });

  it('opens the saved city straight away', async () => {
    saveCity('pune');
    renderApp('/');

    await waitFor(() => expect(url()).toBe('/discover/events-pune'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('puts filters in a readable URL and sends them to the API', async () => {
    saveCity('chennai');
    renderApp('/discover/events-chennai');

    // jsdom ignores media queries, so the desktop panel counts as hidden.
    const panel = await screen.findByRole('region', {
      name: 'Filters',
      hidden: true
    });
    await userEvent.click(
      await within(panel).findByRole('button', {
        name: 'Workshops 2',
        hidden: true
      })
    );
    await userEvent.click(
      within(panel).getByRole('button', { name: 'Music shows 1', hidden: true })
    );

    expect(url()).toBe(
      '/discover/events-chennai?categories=workshops|music-shows'
    );
    expect(listPublic).toHaveBeenLastCalledWith(
      expect.objectContaining({
        city: 'chennai',
        categories: ['WORKSHOP', 'MUSIC_SHOW']
      })
    );
  });

  it('searches from the header within the current city', async () => {
    saveCity('kochi');
    renderApp('/discover/events-kochi');

    await userEvent.type(
      await screen.findByRole('searchbox', { name: 'Search events' }),
      'jazz{Enter}'
    );

    expect(url()).toBe('/discover/events-kochi?q=jazz');
    expect(await screen.findByText(/Results for “jazz”/)).toBeInTheDocument();
  });

  it('adopts the city of a shared link instead of asking', async () => {
    renderApp('/discover/events-mumbai?date=today');

    expect(
      await screen.findByRole('heading', { name: 'Events in Mumbai' })
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        JSON.parse(window.localStorage.getItem(LOCATION_STORAGE_KEY)!)
      ).toEqual({ cityId: 'mumbai' })
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps filters when the city changes from the header', async () => {
    saveCity('chennai');
    renderApp('/discover/events-chennai?categories=kids&radius=300');

    await userEvent.click(
      await screen.findByRole('button', { name: 'Change city (now: Chennai)' })
    );
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Show events in all cities'
      })
    );

    expect(url()).toBe('/discover/events?categories=kids');
  });

  it('sends the home page to Discover for the saved city, and drops unknown cities', async () => {
    saveCity('chennai');
    const { unmount } = renderApp('/?categories=meetups&date=today');
    await waitFor(() =>
      expect(url()).toBe(
        '/discover/events-chennai?categories=meetups&date=today'
      )
    );
    unmount();

    renderApp('/discover/events-atlantis?price=free');
    await waitFor(() => expect(url()).toBe('/discover/events?price=free'));
  });
});
