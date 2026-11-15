import type { Meta, StoryObj } from '@storybook/react-vite';
import { fullEvent, makeEvent } from '@/shared/test/fixtures/events';
import { EventGrid } from './EventGrid';

const meta: Meta<typeof EventGrid> = {
  title: 'Patterns/EventGrid',
  component: EventGrid,
  args: {
    events: [
      makeEvent(),
      fullEvent,
      makeEvent({
        id: 'e3',
        title: 'Laugh Riot: Stand-up Night',
        category: 'COMEDY_SHOW',
        price: { amountMinor: 39_900, currency: 'INR' }
      }),
      makeEvent({
        id: 'e4',
        title: 'Design Systems Day',
        venue: 'Koramangala Social',
        city: { id: 'bengaluru', name: 'Bengaluru' },
        distanceKm: 290
      })
    ]
  }
};

export default meta;

type Story = StoryObj<typeof EventGrid>;

export const Default: Story = {};
