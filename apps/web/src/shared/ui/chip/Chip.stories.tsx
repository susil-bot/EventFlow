import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Elements/Chip',
  component: Chip,
  args: { children: 'Workshops' }
};

export default meta;

type Story = StoryObj<typeof Chip>;

export const Default: Story = {};
export const Selected: Story = { args: { selected: true } };
export const WithCount: Story = { args: { count: 12 } };
export const Disabled: Story = { args: { disabled: true, count: 0 } };
