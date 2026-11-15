import type { Meta, StoryObj } from '@storybook/react-vite';
import { PublishDialog } from './PublishDialog';

const meta: Meta<typeof PublishDialog> = {
  title: 'Patterns/PublishDialog',
  component: PublishDialog,
  args: {
    open: true,
    values: {
      slug: 'react-chennai-meetup',
      timeZone: 'Asia/Kolkata',
      startsAtLocal: '2030-09-03T18:00',
      slots: [],
      scheduleGoLive: false,
      publishAtLocal: ''
    },
    onConfirm: () => undefined,
    onClose: () => undefined
  }
};

export default meta;

type Story = StoryObj<typeof PublishDialog>;

export const PublishNow: Story = {};
export const WithPlannedGoLive: Story = {
  args: {
    values: {
      slug: 'react-chennai-meetup',
      timeZone: 'Asia/Kolkata',
      startsAtLocal: '2030-09-03T18:00',
      slots: [],
      scheduleGoLive: true,
      publishAtLocal: '2030-09-01T10:00'
    }
  }
};
export const Publishing: Story = { args: { isPublishing: true } };
