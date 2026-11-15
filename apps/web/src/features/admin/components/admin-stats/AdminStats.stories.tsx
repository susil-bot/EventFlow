import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminStats } from './AdminStats';

const meta: Meta<typeof AdminStats> = {
  title: 'Patterns/AdminStats',
  component: AdminStats,
  args: {
    stats: {
      users: { ORGANIZER: 4, ATTENDEE: 120, ADMIN: 1 },
      pendingOrganizers: 2,
      suspendedUsers: 1,
      events: { DRAFT: 3, PUBLISHED: 12, CANCELED: 2 },
      upcomingPublishedEvents: 9,
      activeRegistrations: 340
    }
  }
};

export default meta;

type Story = StoryObj<typeof AdminStats>;

export const Default: Story = {};
