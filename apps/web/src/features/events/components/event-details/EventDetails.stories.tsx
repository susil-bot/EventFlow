import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  attendeeUser,
  canceledEvent,
  makeEvent,
  onlineEvent,
  slottedEvent
} from '@/shared/test/fixtures/events';
import { RegistrationPanel } from '../registration-panel';
import { EventDetails } from './EventDetails';

const event = makeEvent();

const meta: Meta<typeof EventDetails> = {
  title: 'Patterns/EventDetails',
  component: EventDetails,
  parameters: { layout: 'padded' },
  args: {
    event,
    registrationSlot: (
      <RegistrationPanel
        event={event}
        viewer={attendeeUser}
        onRegister={() => undefined}
        onCancelRegistration={() => undefined}
      />
    )
  }
};

export default meta;

type Story = StoryObj<typeof EventDetails>;

export const Published: Story = {};
export const Canceled: Story = {
  args: {
    event: canceledEvent,
    registrationSlot: (
      <RegistrationPanel
        event={canceledEvent}
        viewer={attendeeUser}
        onRegister={() => undefined}
        onCancelRegistration={() => undefined}
      />
    )
  }
};

export const OnlineWithLinks: Story = {
  args: { event: onlineEvent, registrationSlot: null }
};
export const WithTimeSlots: Story = {
  args: { event: slottedEvent, registrationSlot: null }
};
