import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Route, Routes, useLocation } from 'react-router';
import type * as endpoints from '@/shared/api/endpoints';
import { authApi, citiesApi, eventsApi } from '@/shared/api/endpoints';
import { cities } from '@/shared/test/fixtures/cities';
import {
  draftEvent,
  makeEvent,
  organizerUser
} from '@/shared/test/fixtures/events';
import { renderWithProviders } from '@/shared/test/render';
import { EditEventPage } from './EditEventPage';

vi.mock('@/shared/api/endpoints', async (importOriginal) => {
  const actual = await importOriginal<typeof endpoints>();
  return {
    ...actual,
    authApi: { ...actual.authApi, session: vi.fn() },
    citiesApi: { list: vi.fn() },
    eventsApi: {
      ...actual.eventsApi,
      get: vi.fn(),
      update: vi.fn(),
      publish: vi.fn(),
      cancel: vi.fn()
    }
  };
});

const draft = { ...draftEvent, city: { id: 'chennai', name: 'Chennai' } };

const Probe = () => <output data-testid="url">{useLocation().pathname}</output>;

const renderEditor = (history: string[] = []) =>
  renderWithProviders(
    <>
      <Routes>
        <Route
          path="/organizer/events/:id/edit"
          element={<EditEventPage id={draft.id} />}
        />
        <Route path="*" element={null} />
      </Routes>
      <Probe />
    </>,
    { route: `/organizer/events/${draft.id}/edit`, history, withAuth: true }
  );

beforeEach(() => {
  vi.mocked(authApi.session).mockResolvedValue(organizerUser);
  vi.mocked(citiesApi.list).mockResolvedValue(cities);
  vi.mocked(eventsApi.get).mockResolvedValue(draft);
  vi.mocked(eventsApi.update).mockImplementation(
    async (_id, body) =>
      ({
        ...draft,
        ...(body as object),
        updatedAt: new Date().toISOString()
      }) as never
  );
  vi.mocked(eventsApi.publish).mockResolvedValue(
    makeEvent({ ...draft, status: 'PUBLISHED', phase: 'LIVE' })
  );
});

describe('event editor', () => {
  it('publishes only after confirming in the Publish dialog', async () => {
    renderEditor();

    await userEvent.click(
      await screen.findByRole('button', { name: 'Publish…' })
    );
    expect(eventsApi.publish).not.toHaveBeenCalled();
    const dialog = screen.getByRole('dialog', { name: 'Publish event' });
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Publish' })
    );

    await waitFor(() =>
      expect(eventsApi.publish).toHaveBeenCalledWith(draft.id)
    );
    expect(eventsApi.update).toHaveBeenCalledWith(
      draft.id,
      expect.objectContaining({ publishAtLocal: null })
    );
    expect(await screen.findByText(/is now live/)).toBeInTheDocument();
  });

  it('keeps Save disabled until something changes, and asks before leaving', async () => {
    renderEditor();

    const save = await screen.findByRole('button', { name: 'Save' });
    expect(save).toBeDisabled();
    await userEvent.type(screen.getByLabelText(/^Title/), ' (updated)');
    expect(save).toBeEnabled();

    await userEvent.click(screen.getByRole('button', { name: 'Close editor' }));
    expect(
      screen.getByRole('dialog', { name: 'Leave without saving?' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('url')).toHaveTextContent(
      `/organizer/events/${draft.id}/edit`
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Discard and leave' })
    );
    expect(screen.getByTestId('url')).toHaveTextContent('/organizer');
  });

  it('asks before the browser Back button throws away unsaved changes', async () => {
    const { router } = renderEditor([
      `/organizer/events/${draft.id}/attendees`
    ]);
    await userEvent.type(await screen.findByLabelText(/^Title/), ' (updated)');

    await act(() => router.navigate(-1));
    expect(
      screen.getByRole('dialog', { name: 'Leave without saving?' })
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByTestId('url')).toHaveTextContent(
      `/organizer/events/${draft.id}/edit`
    );
    expect(screen.getByLabelText(/^Title/)).toHaveValue(
      `${draft.title} (updated)`
    );
  });

  it('needs an acknowledgement to cancel an event people registered for', async () => {
    vi.mocked(eventsApi.get).mockResolvedValue({
      ...draft,
      status: 'PUBLISHED',
      phase: 'LIVE',
      registeredCount: 3
    });
    renderEditor();

    await userEvent.click(
      await screen.findByRole('button', { name: 'More actions' })
    );
    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Cancel event…' })
    );
    const dialog = screen.getByRole('dialog', { name: 'Cancel this event?' });
    const confirm = within(dialog).getByRole('button', {
      name: 'Cancel event'
    });

    expect(confirm).toBeDisabled();
    await userEvent.click(
      within(dialog).getByRole('checkbox', { name: /3 registered people/ })
    );
    expect(confirm).toBeEnabled();
  });
});
