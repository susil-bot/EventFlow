import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextField } from './TextField';

const meta: Meta<typeof TextField> = {
  title: 'Elements/TextField',
  component: TextField,
  args: { label: 'Title', placeholder: 'React Chennai Meetup' }
};

export default meta;

type Story = StoryObj<typeof TextField>;

export const Default: Story = {};
export const Required: Story = { args: { required: true } };
export const WithHint: Story = {
  args: { label: 'Capacity', type: 'number', hint: 'Maximum attendees.' }
};
export const WithError: Story = {
  args: { label: 'Capacity', value: '0', error: 'Capacity must be at least 1.' }
};
export const Multiline: Story = {
  args: {
    label: 'Description',
    multiline: true,
    placeholder: 'What is it about?'
  }
};
