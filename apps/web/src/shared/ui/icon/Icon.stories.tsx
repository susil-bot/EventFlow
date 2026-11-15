import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Icon, ICON_NAMES } from './Icon';

const meta: Meta<typeof Icon> = {
  title: 'Elements/Icon',
  component: Icon,
  args: { name: 'calendar', size: 24 },
  argTypes: { name: { control: 'select', options: ICON_NAMES } }
};

export default meta;

type Story = StoryObj<typeof Icon>;

export const Default: Story = {};

export const AllIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {ICON_NAMES.map((name) => (
        <div key={name} style={{ textAlign: 'center', width: 80 }}>
          <Icon name={name} size={24} />
          <div style={{ fontSize: 11 }}>{name}</div>
        </div>
      ))}
    </div>
  )
};
