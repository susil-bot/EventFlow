import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { EventCover } from './EventCover';

const meta: Meta<typeof EventCover> = {
  title: 'Patterns/EventCover',
  component: EventCover,
  args: { title: 'React Chennai Meetup', size: 'thumb' },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    )
  ]
};

export default meta;

type Story = StoryObj<typeof EventCover>;

export const Thumb: Story = {};
export const Hero: Story = { args: { size: 'hero' } };
export const Muted: Story = { args: { muted: true } };
export const Palette: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {[
        'Node.js Night',
        'Design Roundtable',
        'Postgres Workshop',
        'AI Summit'
      ].map((title) => (
        <EventCover key={title} title={title} />
      ))}
    </div>
  )
};
