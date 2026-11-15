import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  canceledEvent,
  draftEvent,
  makeEvent,
  scheduledEvent
} from '@/shared/test/fixtures/events';
import { PhaseChip } from './PhaseChip';

const meta: Meta<typeof PhaseChip> = {
  title: 'Patterns/PhaseChip',
  component: PhaseChip,
  args: { event: scheduledEvent }
};

export default meta;

type Story = StoryObj<typeof PhaseChip>;

export const Scheduled: Story = {};
export const LiveWithExpiry: Story = {
  args: { event: makeEvent({ expiresAt: '2030-09-03T06:30:00.000Z' }) }
};
export const Expired: Story = {
  args: {
    event: makeEvent({
      phase: 'EXPIRED',
      expiresAt: '2030-09-01T06:30:00.000Z'
    })
  }
};
export const Draft: Story = { args: { event: draftEvent } };
export const Canceled: Story = { args: { event: canceledEvent } };
export const OnACover: Story = {
  args: { variant: 'overlay' },
  decorators: [
    (Story) => (
      <div style={{ padding: 16, background: '#7a9ccf' }}>{Story()}</div>
    )
  ]
};
