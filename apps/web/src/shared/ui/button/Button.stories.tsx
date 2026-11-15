import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Icon } from '../icon';
import { Button, LinkButton } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Elements/Button',
  component: Button,
  args: { children: 'Add Event', variant: 'primary', size: 'md' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'ghost', 'success', 'danger']
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] }
  }
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        Add Event <Icon name="plus" size={16} />
      </>
    )
  }
};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="success">
        Register now
      </Button>
      <Button {...args} variant="danger">
        Cancel event
      </Button>
    </div>
  )
};

export const Loading: Story = { args: { isLoading: true, children: 'Saving' } };

export const Disabled: Story = { args: { disabled: true } };

export const AsLink: Story = {
  render: () => <LinkButton to="/organizer/events/new">Create event</LinkButton>
};
