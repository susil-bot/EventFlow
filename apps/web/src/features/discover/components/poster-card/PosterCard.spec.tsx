import { screen } from '@testing-library/react';
import React from 'react';
import {
  fullEvent,
  makeEvent,
  scheduledEvent
} from '@/shared/test/fixtures/events';
import { renderWithProviders } from '@/shared/test/render';
import { PosterCard } from './PosterCard';

describe('<PosterCard />', () => {
  it('links to the event and shows date, place, category and price', () => {
    renderWithProviders(
      <PosterCard
        event={makeEvent({
          price: { amountMinor: 39_900, currency: 'INR' },
          venue: 'Koramangala Social',
          city: { id: 'bengaluru', name: 'Bengaluru' },
          distanceKm: 290
        })}
      />
    );

    expect(
      screen.getByRole('link', { name: 'React Chennai Meetup' })
    ).toHaveAttribute('href', '/events/react-chennai-meetup');
    // 2030-09-03 18:00 in Asia/Kolkata is a Tuesday.
    expect(screen.getByText('Tue, 3 Sept')).toBeInTheDocument();
    expect(
      screen.getByText('Koramangala Social, Bengaluru')
    ).toBeInTheDocument();
    expect(screen.getByText('Meetup · In person')).toBeInTheDocument();
    expect(screen.getByText('₹399')).toBeInTheDocument();
    expect(screen.getByText('290 km away')).toBeInTheDocument();
    expect(screen.getByText('38 places left')).toBeInTheDocument();
  });

  it('shows free events, online events and multi-session dates', () => {
    renderWithProviders(
      <PosterCard
        event={makeEvent({
          eventType: 'ONLINE',
          city: null,
          slots: [
            {
              id: 'a',
              label: 'A',
              startsAt: '2030-09-03T12:30:00.000Z',
              endsAt: '2030-09-03T13:30:00.000Z',
              startsAtLocal: '2030-09-03T18:00',
              endsAtLocal: '2030-09-03T19:00',
              capacity: 5,
              registeredCount: 0,
              availablePlaces: 5,
              hasStarted: false
            },
            {
              id: 'b',
              label: 'B',
              startsAt: '2030-09-04T12:30:00.000Z',
              endsAt: '2030-09-04T13:30:00.000Z',
              startsAtLocal: '2030-09-04T18:00',
              endsAtLocal: '2030-09-04T19:00',
              capacity: 5,
              registeredCount: 0,
              availablePlaces: 5,
              hasStarted: false
            }
          ]
        })}
      />
    );

    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText(/onwards/)).toBeInTheDocument();
  });

  it('flags sold-out events on the poster', () => {
    renderWithProviders(<PosterCard event={fullEvent} />);
    expect(screen.getByText('Sold out')).toBeInTheDocument();
  });

  it('shows the status chip only to people who manage the event', () => {
    const { rerender } = renderWithProviders(
      <PosterCard event={scheduledEvent} />
    );
    expect(screen.queryByText('Scheduled')).not.toBeInTheDocument();

    rerender(<PosterCard event={scheduledEvent} showStaffStatus />);
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });

  it('shows no chip on a live event, even to its organizer', () => {
    renderWithProviders(
      <PosterCard
        event={makeEvent({ expiresAt: '2030-09-03T06:30:00.000Z' })}
        showStaffStatus
      />
    );
    expect(screen.queryByText('Live')).not.toBeInTheDocument();
  });
});
