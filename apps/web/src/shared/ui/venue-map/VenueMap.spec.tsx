import { render, screen } from '@testing-library/react';
import React from 'react';
import { directionsUrl, VenueMap } from './VenueMap';

const PIN = { latitude: 13.0105, longitude: 80.212 };

const pins = (container: HTMLElement) =>
  container.querySelectorAll('.venue-map-pin');

describe('<VenueMap />', () => {
  it('shows an OpenStreetMap map with the venue pin', () => {
    const { container } = render(
      <VenueMap location={PIN} label="Map of WeWork" />
    );
    expect(
      screen.getByRole('region', { name: 'Map of WeWork' })
    ).toBeInTheDocument();
    expect(pins(container)).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'OpenStreetMap' })).toHaveAttribute(
      'href',
      'https://www.openstreetmap.org/copyright'
    );
  });

  it('adds, moves and removes the pin as the location changes', () => {
    const { container, rerender } = render(
      <VenueMap location={null} label="Venue map" onChange={vi.fn()} />
    );
    expect(pins(container)).toHaveLength(0);

    rerender(<VenueMap location={PIN} label="Venue map" onChange={vi.fn()} />);
    expect(pins(container)).toHaveLength(1);

    rerender(
      <VenueMap
        location={{ latitude: 13.05, longitude: 80.28 }}
        label="Venue map"
        onChange={vi.fn()}
      />
    );
    expect(pins(container)).toHaveLength(1);

    rerender(<VenueMap location={null} label="Venue map" onChange={vi.fn()} />);
    expect(pins(container)).toHaveLength(0);
  });

  it('builds a directions link without an API key', () => {
    expect(directionsUrl(PIN)).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=13.0105,80.212'
    );
  });
});
