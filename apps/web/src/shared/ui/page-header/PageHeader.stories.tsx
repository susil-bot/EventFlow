import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { LinkButton } from '../button';
import { Icon } from '../icon';
import { PageHeader } from './PageHeader';

const meta: Meta<typeof PageHeader> = {
  title: 'Patterns/PageHeader',
  component: PageHeader,
  args: {
    eyebrow: 'Thursday, Nov 12, 2026',
    title: 'Upcoming events',
    description: 'Discover published events and save your place.'
  }
};

export default meta;

type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {};
export const WithAction: Story = {
  args: {
    title: 'My events',
    actions: (
      <LinkButton to="/organizer/events/new">
        Add Event <Icon name="plus" size={16} />
      </LinkButton>
    )
  }
};
