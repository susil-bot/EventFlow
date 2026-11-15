import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { type MapPoint, VenueMap } from './VenueMap';

const meta: Meta<typeof VenueMap> = {
  title: 'Elements/VenueMap',
  component: VenueMap,
  args: {
    label: 'Map of Tidel Park, Chennai',
    location: { latitude: 12.9894, longitude: 80.2486 }
  }
};

export default meta;

type Story = StoryObj<typeof VenueMap>;

/** Read-only, as on the event page. */
export const Pinned: Story = {};

/** No pin yet: centred on the event's city. */
export const CityOnly: Story = {
  args: { location: null, center: { latitude: 13.0827, longitude: 80.2707 } }
};

/** Editable, as on the event form: drag the pin or click the map. */
export const Editable: Story = {
  render: (args) => {
    const Demo = () => {
      const [location, setLocation] = useState<MapPoint | null>(args.location);
      return (
        <>
          <VenueMap {...args} location={location} onChange={setLocation} />
          <p>
            {location
              ? `${location.latitude}, ${location.longitude}`
              : 'No pin'}
          </p>
        </>
      );
    };
    return <Demo />;
  }
};
