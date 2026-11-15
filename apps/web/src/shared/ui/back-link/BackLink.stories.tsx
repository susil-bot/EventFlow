import type { Meta, StoryObj } from '@storybook/react-vite';
import { BackLink } from './BackLink';

const meta: Meta<typeof BackLink> = {
  title: 'Elements/BackLink',
  component: BackLink,
  args: { fallback: '/organizer' }
};

export default meta;

type Story = StoryObj<typeof BackLink>;

export const Default: Story = {};
export const CustomLabel: Story = { args: { children: 'Back to events' } };
