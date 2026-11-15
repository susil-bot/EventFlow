import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'Patterns/StatCard',
  component: StatCard,
  args: { label: 'Active registrations', value: 42, icon: 'users' }
};

export default meta;

type Story = StoryObj<typeof StatCard>;

export const Default: Story = {};

export const Row: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16
      }}
    >
      <StatCard label="Events" value={5} icon="calendar" />
      <StatCard label="Active registrations" value={42} icon="users" />
      <StatCard label="Places available" value={118} icon="ticket" />
    </div>
  )
};
