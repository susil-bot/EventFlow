import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Button } from '../button';
import { InlineAlert } from './InlineAlert';

const meta: Meta<typeof InlineAlert> = {
  title: 'Elements/InlineAlert',
  component: InlineAlert,
  args: {
    tone: 'danger',
    title: "We couldn't sign you in",
    children:
      'EventFlow is temporarily unavailable. Please try again in a moment.',
    reference: 'ecfc957b'
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['danger', 'warning', 'info'] }
  }
};

export default meta;

type Story = StoryObj<typeof InlineAlert>;

export const ServerError: Story = {
  args: { action: <Button variant="secondary">Try again</Button> }
};

export const WrongPassword: Story = {
  args: {
    title: undefined,
    reference: undefined,
    children: 'Email or password is incorrect.'
  }
};

export const RateLimited: Story = {
  args: {
    tone: 'warning',
    title: 'Too many attempts',
    reference: undefined,
    children: 'Please try again in a few minutes.'
  }
};
