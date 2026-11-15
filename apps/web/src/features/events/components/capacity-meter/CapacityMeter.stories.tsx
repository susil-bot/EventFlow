import type { Meta, StoryObj } from '@storybook/react-vite';
import { CapacityMeter } from './CapacityMeter';

const meta: Meta<typeof CapacityMeter> = {
  title: 'Patterns/CapacityMeter',
  component: CapacityMeter,
  args: { registered: 12, capacity: 50 }
};

export default meta;

type Story = StoryObj<typeof CapacityMeter>;

export const Plenty: Story = {};
export const AlmostFull: Story = { args: { registered: 45 } };
export const Full: Story = { args: { registered: 50 } };
