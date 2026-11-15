import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import type { PlaceResult } from '@/shared/api/geocoding';
import type { VenueLocation } from '@/shared/api/types';
import { VenueLocationField } from './VenueLocationField';

/** Canned results so the story works offline and doesn't call Nominatim. */
const fakeSearch = async (): Promise<PlaceResult[]> => [
  {
    id: '1',
    label: 'Tidel Park, Rajiv Gandhi Salai, Taramani, Chennai, Tamil Nadu',
    location: { latitude: 12.9894, longitude: 80.2486 }
  },
  {
    id: '2',
    label: 'Tidel Park Metro, Taramani, Chennai, Tamil Nadu',
    location: { latitude: 12.9868, longitude: 80.2454 }
  }
];

const CHENNAI = { latitude: 13.0827, longitude: 80.2707 };

const meta: Meta<typeof VenueLocationField> = {
  title: 'Organizer/VenueLocationField',
  component: VenueLocationField,
  args: {
    suggestedQuery: 'Tidel Park, Chennai',
    center: CHENNAI,
    required: true,
    search: fakeSearch
  },
  render: (args) => {
    const Demo = () => {
      const [value, setValue] = useState<VenueLocation | null>(args.value);
      return <VenueLocationField {...args} value={value} onChange={setValue} />;
    };
    return <Demo />;
  }
};

export default meta;

type Story = StoryObj<typeof VenueLocationField>;

export const NoPinYet: Story = { args: { value: null } };
export const Pinned: Story = {
  args: { value: { latitude: 12.9894, longitude: 80.2486 } }
};
export const MissingWhenPublishing: Story = {
  args: {
    value: null,
    error: 'Pin the venue on the map before publishing.'
  }
};
