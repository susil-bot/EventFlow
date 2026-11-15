import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  canceledEvent,
  makeEvent,
  makeRegistration
} from '@/shared/test/fixtures/events';
import { RegistrationList } from './RegistrationList';

const meta: Meta<typeof RegistrationList> = {
  title: 'Patterns/RegistrationList',
  component: RegistrationList,
  args: {
    onCancel: () => undefined,
    registrations: [
      makeRegistration(),
      makeRegistration({
        id: 'reg-2',
        event: makeEvent({ id: 'e2', title: 'Node.js London Night' })
      }),
      makeRegistration({ id: 'reg-3', event: canceledEvent }),
      makeRegistration({
        id: 'reg-4',
        status: 'CANCELED',
        canceledAt: '2030-08-12T10:00:00.000Z',
        event: makeEvent({ id: 'e4', title: 'Design Systems Day' })
      })
    ]
  }
};

export default meta;

type Story = StoryObj<typeof RegistrationList>;

export const Mixed: Story = {};
export const OnlyCanceled: Story = {
  args: {
    registrations: [
      makeRegistration({
        status: 'CANCELED',
        canceledAt: '2030-08-12T10:00:00.000Z'
      })
    ]
  }
};
