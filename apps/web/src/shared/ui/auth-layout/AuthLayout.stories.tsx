import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Button } from '../button';
import { TextField } from '../text-field';
import { AuthLayout } from './AuthLayout';

const meta: Meta<typeof AuthLayout> = {
  title: 'Templates/AuthLayout',
  component: AuthLayout,
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Welcome back',
    subtitle: 'Sign in to manage events and registrations.',
    children: (
      <>
        <TextField label="Email" type="email" />
        <TextField label="Password" type="password" />
        <Button fullWidth>Sign in</Button>
      </>
    )
  }
};

export default meta;

type Story = StoryObj<typeof AuthLayout>;

export const SignIn: Story = {};
