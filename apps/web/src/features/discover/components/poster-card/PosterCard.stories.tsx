import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  fullEvent,
  makeEvent,
  scheduledEvent
} from '@/shared/test/fixtures/events';
import { PosterCard } from './PosterCard';

const meta: Meta<typeof PosterCard> = {
  title: 'Patterns/PosterCard',
  component: PosterCard,
  decorators: [(Story) => <div style={{ maxWidth: 280 }}>{Story()}</div>],
  args: {
    event: makeEvent({ price: { amountMinor: 39_900, currency: 'INR' } })
  }
};

export default meta;

type Story = StoryObj<typeof PosterCard>;

export const Paid: Story = {};
export const Free: Story = { args: { event: makeEvent() } };
export const Nearby: Story = {
  args: {
    event: makeEvent({
      venue: 'Koramangala Social',
      city: { id: 'bengaluru', name: 'Bengaluru' },
      distanceKm: 290
    })
  }
};
export const SoldOut: Story = { args: { event: fullEvent } };
/** What the organizer (or an admin) sees on their own scheduled event. */
export const ForTheOrganizer: Story = {
  args: { showStaffStatus: true, event: scheduledEvent }
};
