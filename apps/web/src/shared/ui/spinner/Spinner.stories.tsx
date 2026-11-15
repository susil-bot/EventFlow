import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Elements/Spinner',
  component: Spinner,
  args: { size: 'md', label: 'Loading events' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } }
};

export default meta;

type Story = StoryObj<typeof Spinner>;

export const Medium: Story = {};
export const Small: Story = { args: { size: 'sm' } };
export const Large: Story = { args: { size: 'lg' } };
