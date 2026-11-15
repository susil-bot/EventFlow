import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  draftEvent,
  fullEvent,
  makeEvent
} from '@/shared/test/fixtures/events';
import { AdminEventTable } from './AdminEventTable';

const meta: Meta<typeof AdminEventTable> = {
  title: 'Patterns/AdminEventTable',
  component: AdminEventTable,
  args: {
    events: [
      makeEvent(),
      fullEvent,
      draftEvent,
      makeEvent({
        id: 'evt-mod',
        title: 'Crypto Giveaway Night',
        status: 'CANCELED',
        cancellationReason: 'Violates the event policy'
      })
    ]
  }
};

export default meta;

type Story = StoryObj<typeof AdminEventTable>;

export const Default: Story = {};
