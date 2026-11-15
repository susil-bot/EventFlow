import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Elements/Checkbox',
  component: Checkbox,
  args: { label: 'Include online events', defaultChecked: true }
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Checked: Story = {};
export const Unchecked: Story = { args: { defaultChecked: false } };
export const Disabled: Story = { args: { disabled: true } };
