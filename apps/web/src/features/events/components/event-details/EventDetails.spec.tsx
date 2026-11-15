import { screen } from '@testing-library/react';
import React from 'react';
import {
  makeEvent,
  onlineEvent,
  slottedEvent
} from '@/shared/test/fixtures/events';
import { renderWithProviders } from '@/shared/test/render';
import { EventDetails } from './EventDetails';

describe('<EventDetails />', () => {
  it('shows the meeting link, category and social links of an online event', () => {
    renderWithProviders(
      <EventDetails event={onlineEvent} registrationSlot={null} />
    );

    expect(screen.getByRole('link', { name: 'Join online' })).toHaveAttribute(
      'href',
      'https://meet.example.com/pg'
    );
    expect(screen.getByText('Webinar')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'LinkedIn (opens in a new tab)' })
    ).toHaveAttribute('rel', 'noopener noreferrer');
    // Online-only events have no venue section.
    expect(screen.queryByText('Location')).not.toBeInTheDocument();
  });

  it('hides the link from people without a place', () => {
    renderWithProviders(
      <EventDetails
        event={{ ...onlineEvent, onlineUrl: null }}
        registrationSlot={null}
      />
    );

    expect(
      screen.queryByRole('link', { name: 'Join online' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/shared with registered attendees/)
    ).toBeInTheDocument();
  });

  it('lists time slots with their availability', () => {
    renderWithProviders(
      <EventDetails event={slottedEvent} registrationSlot={null} />
    );

    expect(screen.getByText('Morning batch')).toBeInTheDocument();
    expect(screen.getByText('Full')).toBeInTheDocument();
    expect(screen.getByText('2 places left')).toBeInTheDocument();
  });

  it('shows the venue on a map with a directions link', () => {
    renderWithProviders(
      <EventDetails event={makeEvent()} registrationSlot={null} />
    );

    expect(
      screen.getByRole('region', { name: 'Map of Tidel Park, Chennai' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Get directions (opens in a new tab)' })
    ).toHaveAttribute(
      'href',
      'https://www.google.com/maps/dir/?api=1&destination=12.9894,80.2486'
    );
  });

  it('shows no map for a venue without a pin', () => {
    renderWithProviders(
      <EventDetails
        event={makeEvent({ venueLocation: null })}
        registrationSlot={null}
      />
    );

    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });
});
