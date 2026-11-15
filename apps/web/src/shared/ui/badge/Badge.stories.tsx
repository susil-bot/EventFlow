import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Elements/Badge',
  component: Badge,
  args: { children: 'Published', tone: 'success' },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['success', 'warning', 'danger', 'info', 'neutral']
    }
  }
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Badge tone="success">Published</Badge>
      <Badge tone="warning">2 places left</Badge>
      <Badge tone="danger">Canceled</Badge>
      <Badge tone="info">Registered</Badge>
      <Badge tone="neutral">Draft</Badge>
    </div>
  )
};
