import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  canceledEvent,
  makeEvent,
  makeRegistration
} from '@/shared/test/fixtures/events';
import { RegistrationItem } from './RegistrationItem';

/** A small inline image, so the story works offline. */
const COVER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40"><rect width="64" height="40" fill="#1f7a8c"/><circle cx="46" cy="14" r="8" fill="#e4f0f2"/></svg>'
  );

const meta: Meta<typeof RegistrationItem> = {
  title: 'Patterns/RegistrationItem',
  component: RegistrationItem,
  args: { registration: makeRegistration(), onCancel: () => undefined },
  decorators: [
    (Story) => (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <Story />
      </ul>
    )
  ]
};

export default meta;

type Story = StoryObj<typeof RegistrationItem>;

export const Active: Story = {};
export const WithCoverImage: Story = {
  args: {
    registration: makeRegistration({
      event: makeEvent({
        images: [{ id: 'img-1', url: COVER }]
      })
    })
  }
};
export const Canceling: Story = { args: { isCanceling: true } };
export const RegistrationCanceled: Story = {
  args: {
    registration: makeRegistration({
      status: 'CANCELED',
      canceledAt: '2030-08-12T10:00:00.000Z'
    })
  }
};
export const EventCanceled: Story = {
  args: { registration: makeRegistration({ event: canceledEvent }) }
};
