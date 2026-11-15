import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { ActionMenu } from './ActionMenu';

const meta: Meta<typeof ActionMenu> = {
  title: 'Elements/ActionMenu',
  component: ActionMenu,
  args: {
    label: 'More actions',
    items: [
      { label: 'View attendees', onSelect: () => undefined },
      { label: 'Unpublish', onSelect: () => undefined },
      { label: 'Cancel event', onSelect: () => undefined, tone: 'danger' }
    ]
  },
  render: (args) => (
    <div style={{ minHeight: 200 }}>
      <ActionMenu {...args} />
    </div>
  )
};

export default meta;

type Story = StoryObj<typeof ActionMenu>;

export const Default: Story = {};
export const WithDisabledItem: Story = {
  args: {
    items: [
      { label: 'Unpublish', onSelect: () => undefined, disabled: true },
      { label: 'Cancel event', onSelect: () => undefined, tone: 'danger' }
    ]
  }
};
