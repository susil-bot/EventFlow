import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  canceledEvent,
  draftEvent,
  fullEvent,
  makeEvent,
  scheduledEvent
} from '@/shared/test/fixtures/events';
import { OrganizerEventList } from './OrganizerEventList';

const meta: Meta<typeof OrganizerEventList> = {
  title: 'Patterns/OrganizerEventList',
  component: OrganizerEventList,
  args: {
    onNavigate: () => undefined,
    openInNewTab: () => undefined,
    events: [
      makeEvent({
        images: [{ id: 'img-1', url: 'https://picsum.photos/seed/meetup/200' }],
        lastEditedBy: { id: 'org-1', name: 'Olivia Organizer' }
      }),
      scheduledEvent,
      draftEvent,
      fullEvent,
      canceledEvent
    ]
  }
};

export default meta;

type Story = StoryObj<typeof OrganizerEventList>;

export const Default: Story = {};
export const Single: Story = { args: { events: [draftEvent] } };
