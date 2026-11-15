import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Route, Routes, useLocation } from 'react-router';
import type * as endpoints from '@/shared/api/endpoints';
import { authApi, citiesApi, eventsApi } from '@/shared/api/endpoints';
import { cities } from '@/shared/test/fixtures/cities';
import { draftEvent, organizerUser } from '@/shared/test/fixtures/events';
import { renderWithProviders } from '@/shared/test/render';
import { chooseOption } from '@/shared/test/select';
import { CreateEventPage } from './CreateEventPage';

vi.mock('@/shared/api/endpoints', async (importOriginal) => {
  const actual = await importOriginal<typeof endpoints>();
  return {
    ...actual,
    authApi: { ...actual.authApi, session: vi.fn() },
    citiesApi: { list: vi.fn() },
    eventsApi: { ...actual.eventsApi, create: vi.fn(), get: vi.fn() }
  };
});

const Probe = () => <output data-testid="url">{useLocation().pathname}</output>;

const renderPage = () =>
  renderWithProviders(
    <>
      <Routes>
        <Route path="/organizer/events/new" element={<CreateEventPage />} />
        <Route path="*" element={<h1>Somewhere else</h1>} />
      </Routes>
      <Probe />
    </>,
    {
      route: '/organizer/events/new',
      history: ['/organizer'],
      withAuth: true
    }
  );

beforeEach(() => {
  vi.mocked(authApi.session).mockResolvedValue(organizerUser);
  vi.mocked(citiesApi.list).mockResolvedValue(cities);
  vi.mocked(eventsApi.create).mockResolvedValue(draftEvent);
  vi.mocked(eventsApi.get).mockResolvedValue(draftEvent);
});

describe('<CreateEventPage />', () => {
  it('asks before leaving a half-filled form, and keeps the input', async () => {
    renderPage();
    const title = await screen.findByLabelText(/^Title/);
    await userEvent.type(title, 'Half-written event');

    await userEvent.click(screen.getByRole('button', { name: 'Close editor' }));
    await userEvent.click(screen.getByRole('button', { name: 'Keep editing' }));

    expect(screen.getByTestId('url')).toHaveTextContent(
      '/organizer/events/new'
    );
    expect(title).toHaveValue('Half-written event');
  });

  it('opens the saved event without asking', async () => {
    renderPage();
    await userEvent.type(await screen.findByLabelText(/^Title/), 'Lab');
    await userEvent.type(screen.getByLabelText(/^Description/), 'About it');
    await chooseOption(screen.getByLabelText(/Category/), 'Meetup');
    await userEvent.type(
      screen.getByLabelText(/Start date and time/),
      '2030-09-03T18:00'
    );
    await chooseOption(screen.getByLabelText(/^City/), 'Chennai');
    await userEvent.type(screen.getByLabelText(/Venue or location/), 'Hall');
    await userEvent.type(screen.getByLabelText(/Maximum capacity/), '20');

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Somewhere else')).toBeInTheDocument();
    expect(screen.getByTestId('url')).toHaveTextContent(
      `/organizer/events/${draftEvent.id}/edit`
    );
    expect(
      screen.queryByRole('dialog', { name: 'Leave without saving?' })
    ).not.toBeInTheDocument();
  });
});
