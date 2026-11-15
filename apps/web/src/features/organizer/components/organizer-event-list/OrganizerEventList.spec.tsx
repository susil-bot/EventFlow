import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  canceledEvent,
  draftEvent,
  makeEvent,
  scheduledEvent
} from '@/shared/test/fixtures/events';
import { renderWithProviders } from '@/shared/test/render';
import { OrganizerEventList } from './OrganizerEventList';
import { statusBadgeFor } from './StatusBadge';

const rowFor = (title: string) =>
  screen.getByRole('link', { name: title }).closest('li') as HTMLElement;

const renderList = () => {
  const onNavigate = vi.fn();
  const openInNewTab = vi.fn();
  renderWithProviders(
    <OrganizerEventList
      events={[
        makeEvent({ lastEditedBy: { id: 'org-1', name: 'Olivia Organizer' } }),
        scheduledEvent,
        draftEvent,
        canceledEvent
      ]}
      onNavigate={onNavigate}
      openInNewTab={openInNewTab}
    />
  );
  return { onNavigate, openInNewTab };
};

describe('<OrganizerEventList />', () => {
  it('shows each event with its places, last update and status', () => {
    renderList();

    expect(screen.getByText('1 - 4 of 4 events')).toBeInTheDocument();
    const live = rowFor('React Chennai Meetup');
    expect(
      within(live).getByText('12 / 50 registered · 38 places left')
    ).toBeInTheDocument();
    expect(
      within(live).getByText(/Updated .* by Olivia Organizer/)
    ).toBeInTheDocument();
    expect(within(live).getByRole('img', { name: 'Live' })).toBeInTheDocument();
    expect(
      within(rowFor(scheduledEvent.title)).getByRole('img', {
        name: /^Scheduled: goes live/
      })
    ).toBeInTheDocument();
    expect(
      within(rowFor(draftEvent.title)).getByRole('img', { name: 'Draft' })
    ).toBeInTheDocument();
  });

  it('opens editable events in the editor and has no one-click changes', async () => {
    const { onNavigate, openInNewTab } = renderList();
    const draftRow = rowFor(draftEvent.title);

    expect(
      within(draftRow).getByRole('link', { name: draftEvent.title })
    ).toHaveAttribute('href', `/organizer/events/${draftEvent.id}/edit`);
    await userEvent.click(
      within(draftRow).getByRole('button', {
        name: `Actions for ${draftEvent.title}`
      })
    );
    expect(
      screen.getAllByRole('menuitem').map((item) => item.textContent)
    ).toEqual(['Edit', 'Open in new tab', 'Preview', 'View attendees']);
    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Open in new tab' })
    );
    expect(openInNewTab).toHaveBeenCalledWith(
      `/organizer/events/${draftEvent.id}/edit`
    );

    await userEvent.click(
      within(draftRow).getByRole('button', {
        name: `Actions for ${draftEvent.title}`
      })
    );
    await userEvent.click(
      screen.getByRole('menuitem', { name: 'View attendees' })
    );
    expect(onNavigate).toHaveBeenCalledWith(
      `/organizer/events/${draftEvent.id}/attendees`
    );
    expect(
      screen.queryByRole('menuitem', { name: /Publish|Cancel/ })
    ).not.toBeInTheDocument();
  });

  it("doesn't offer editing for a canceled event", async () => {
    renderList();
    const row = rowFor(canceledEvent.title);
    expect(
      within(row).getByRole('link', { name: canceledEvent.title })
    ).toHaveAttribute('href', `/events/${canceledEvent.slug}`);
    await userEvent.click(
      within(row).getByRole('button', {
        name: `Actions for ${canceledEvent.title}`
      })
    );
    expect(
      screen.queryByRole('menuitem', { name: 'Edit' })
    ).not.toBeInTheDocument();
  });

  it('labels a go-live today or tomorrow in the event time zone', () => {
    const now = new Date('2030-09-01T02:00:00.000Z');
    const at = (iso: string) =>
      statusBadgeFor({ ...scheduledEvent, publishAt: iso }, now).text;
    expect(at('2030-09-01T04:30:00.000Z')).toBe('Today 10:00');
    expect(at('2030-09-02T04:30:00.000Z')).toBe('Tomorrow');
    expect(at('2030-09-15T04:30:00.000Z')).toBe('15 Sept 2030');
  });
});
