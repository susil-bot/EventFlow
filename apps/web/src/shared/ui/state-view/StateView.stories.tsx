import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { LinkButton } from '../button';
import { StateView } from './StateView';

const meta: Meta<typeof StateView> = {
  title: 'Patterns/StateView',
  component: StateView,
  args: { children: <p>Loaded content</p>, onRetry: () => undefined }
};

export default meta;

type Story = StoryObj<typeof StateView>;

export const Loading: Story = {
  args: { isLoading: true, loadingLabel: 'Loading events' }
};

export const ErrorState: Story = {
  args: { error: new Error('Cannot reach the server.') }
};

export const Empty: Story = {
  args: {
    isEmpty: true,
    emptyTitle: 'No upcoming events',
    emptyMessage: 'Check back soon — new events are published every week.',
    emptyAction: (
      <LinkButton to="/organizer/events/new">Create event</LinkButton>
    )
  }
};

export const Content: Story = {};
