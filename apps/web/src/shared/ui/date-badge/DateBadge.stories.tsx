import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateBadge } from './DateBadge';

const meta: Meta<typeof DateBadge> = {
  title: 'Elements/DateBadge',
  component: DateBadge,
  args: { month: 'SEP', day: '3' }
};

export default meta;

type Story = StoryObj<typeof DateBadge>;

export const Default: Story = {};
export const TwoDigitDay: Story = { args: { month: 'DEC', day: '24' } };
