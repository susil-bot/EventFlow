import type { Meta, StoryObj } from '@storybook/react-vite';
import { makeEvent, scheduledEvent } from '@/shared/test/fixtures/events';
import { EditorHeader } from './EditorHeader';

const meta: Meta<typeof EditorHeader> = {
  title: 'Patterns/EditorHeader',
  component: EditorHeader,
  args: {
    event: makeEvent({
      lastEditedBy: { id: 'org-1', name: 'Olivia Organizer' }
    }),
    attendeesHref: '/organizer/events/evt-1/attendees'
  }
};

export default meta;

type Story = StoryObj<typeof EditorHeader>;

export const Live: Story = {};
export const Scheduled: Story = { args: { event: scheduledEvent } };
export const EditedByAdmin: Story = {
  args: {
    eyebrow: 'Admin · organized by Olivia Organizer · changes are audited',
    attendeesHref: undefined,
    event: makeEvent({ lastEditedBy: { id: 'adm-1', name: 'Ada Admin' } })
  }
};
export const NewEvent: Story = { args: { event: undefined } };
