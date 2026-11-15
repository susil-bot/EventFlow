import type { Meta, StoryObj } from '@storybook/react-vite';
import { attendees } from '@/shared/test/fixtures/events';
import { AttendeeTable } from './AttendeeTable';

const meta: Meta<typeof AttendeeTable> = {
  title: 'Patterns/AttendeeTable',
  component: AttendeeTable,
  args: { attendees }
};

export default meta;

type Story = StoryObj<typeof AttendeeTable>;

export const Default: Story = {};
