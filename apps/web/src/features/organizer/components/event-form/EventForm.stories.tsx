import type { Meta, StoryObj } from '@storybook/react-vite';
import { cities } from '@/shared/test/fixtures/cities';
import { EventForm } from './EventForm';

const meta: Meta<typeof EventForm> = {
  title: 'Patterns/EventForm',
  component: EventForm,
  args: {
    mode: 'create',
    cities,
    onSubmit: () => undefined,
    onCancel: () => undefined
  }
};

export default meta;

type Story = StoryObj<typeof EventForm>;

export const Create: Story = {};

export const Edit: Story = {
  args: {
    mode: 'edit',
    minCapacity: 12,
    initialValues: {
      title: 'React Chennai Meetup',
      description: 'Monthly meetup on React and testing.',
      startsAtLocal: '2030-09-03T18:00',
      timeZone: 'Asia/Kolkata',
      venue: 'Tidel Park, Chennai',
      capacity: 50
    }
  }
};

export const WithServerErrors: Story = {
  args: {
    ...Edit.args,
    serverErrors: {
      startsAtLocal: 'Start time must be in the future.',
      capacity: 'Must be at least 12, the number of active registrations.'
    }
  }
};

export const Submitting: Story = {
  args: { submittingIntent: 'publish' }
};
