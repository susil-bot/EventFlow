import { screen } from '@testing-library/react';
import React from 'react';
import { makeEvent, scheduledEvent } from '@/shared/test/fixtures/events';
import { renderWithProviders } from '@/shared/test/render';
import { describeLastModified, EditorHeader } from './EditorHeader';

describe('<EditorHeader />', () => {
  it('says who changed the event last and when', () => {
    const event = makeEvent({
      updatedAt: '2030-11-13T08:11:00.000Z',
      lastEditedBy: { id: 'adm-1', name: 'Ada Admin' }
    });
    expect(describeLastModified(event)).toMatch(
      /^Last modified on 13 November 2030 at \d{2}:\d{2} by Ada Admin$/
    );
  });

  it('shows the status, registrations and a link to the event page', () => {
    renderWithProviders(
      <EditorHeader
        event={scheduledEvent}
        attendeesHref="/organizer/events/evt-scheduled/attendees"
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Edit event' })
    ).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /0 registrations/ })
    ).toHaveAttribute('href', '/organizer/events/evt-scheduled/attendees');
    expect(
      screen.getByRole('link', { name: /View event page/ })
    ).toHaveAttribute('href', `/events/${scheduledEvent.slug}`);
  });

  it('introduces a new event', () => {
    renderWithProviders(<EditorHeader />);
    expect(
      screen.getByRole('heading', { name: 'Create event' })
    ).toBeInTheDocument();
  });
});
