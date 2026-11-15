import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  canceledEvent,
  draftEvent,
  fullEvent,
  makeEvent
} from '@/shared/test/fixtures/events';
import { DashboardStats } from './DashboardStats';

const meta: Meta<typeof DashboardStats> = {
  title: 'Patterns/DashboardStats',
  component: DashboardStats,
  args: { events: [makeEvent(), fullEvent, draftEvent, canceledEvent] }
};

export default meta;

type Story = StoryObj<typeof DashboardStats>;

export const Default: Story = {};
