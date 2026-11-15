import type { Meta, StoryObj } from '@storybook/react-vite';
import { makeAdminUser } from '@/shared/test/fixtures/events';
import { AdminUserTable } from './AdminUserTable';

const meta: Meta<typeof AdminUserTable> = {
  title: 'Patterns/AdminUserTable',
  component: AdminUserTable,
  args: {
    currentUserId: 'adm-1',
    users: [
      makeAdminUser({
        id: 'u1',
        name: 'Priya Pending',
        status: 'PENDING_APPROVAL'
      }),
      makeAdminUser({ id: 'u2', upcomingEventCount: 3 }),
      makeAdminUser({
        id: 'u3',
        name: 'Asha Attendee',
        role: 'ATTENDEE',
        activeRegistrationCount: 2
      }),
      makeAdminUser({
        id: 'u4',
        name: 'Sam Suspended',
        role: 'ATTENDEE',
        status: 'SUSPENDED'
      }),
      makeAdminUser({ id: 'adm-1', name: 'Ada Admin', role: 'ADMIN' })
    ]
  }
};

export default meta;

type Story = StoryObj<typeof AdminUserTable>;

export const Default: Story = {};
