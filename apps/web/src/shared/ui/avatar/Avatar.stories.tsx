import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Elements/Avatar',
  component: Avatar,
  args: { name: 'Olivia Organizer', size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } }
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};
export const Large: Story = { args: { size: 'lg', name: 'Asha Attendee' } };
