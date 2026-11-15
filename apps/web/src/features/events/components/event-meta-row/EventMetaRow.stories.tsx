import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { DateBadge } from '@/shared/ui/date-badge';
import { EventMetaRow } from './EventMetaRow';

const meta: Meta<typeof EventMetaRow> = {
  title: 'Patterns/EventMetaRow',
  component: EventMetaRow,
  args: {
    icon: 'pin',
    primary: 'Tidel Park',
    secondary: 'Chennai, Tamil Nadu'
  }
};

export default meta;

type Story = StoryObj<typeof EventMetaRow>;

export const Location: Story = {};

export const DateWithBadge: Story = {
  args: {
    icon: undefined,
    leading: <DateBadge month="SEP" day="3" />,
    primary: 'Wednesday, September 3, 2025',
    secondary: '10:00 AM GMT+5:30 · Asia/Kolkata'
  }
};
