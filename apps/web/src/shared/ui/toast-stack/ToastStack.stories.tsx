import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastStack } from './ToastStack';

const meta: Meta<typeof ToastStack> = {
  title: 'Patterns/ToastStack',
  component: ToastStack,
  args: {
    onDismiss: () => undefined,
    toasts: [
      {
        id: 1,
        tone: 'success',
        message: "You're registered for React Chennai Meetup."
      },
      { id: 2, tone: 'error', message: 'This event is fully booked.' },
      { id: 3, tone: 'info', message: 'Event saved as draft.' }
    ]
  }
};

export default meta;

type Story = StoryObj<typeof ToastStack>;

export const Default: Story = {};
