import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  attendeeUser,
  canceledEvent,
  fullEvent,
  makeEvent,
  makeRegistration,
  organizerUser,
  slottedEvent
} from '@/shared/test/fixtures/events';
import { RegistrationPanel } from './RegistrationPanel';

const meta: Meta<typeof RegistrationPanel> = {
  title: 'Patterns/RegistrationPanel',
  component: RegistrationPanel,
  args: {
    event: makeEvent(),
    viewer: attendeeUser,
    onRegister: () => undefined,
    onCancelRegistration: () => undefined
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    )
  ]
};

export default meta;

type Story = StoryObj<typeof RegistrationPanel>;

export const OpenForAttendee: Story = {};
export const Registering: Story = { args: { isRegistering: true } };
export const Registered: Story = {
  args: { registration: makeRegistration() }
};
export const SignedOut: Story = { args: { viewer: null } };
export const PickATimeSlot: Story = { args: { event: slottedEvent } };
export const Full: Story = { args: { event: fullEvent } };
export const Canceled: Story = { args: { event: canceledEvent } };
export const OwnerView: Story = { args: { viewer: organizerUser } };
export const Started: Story = {
  args: { event: makeEvent({ hasStarted: true, isRegistrationOpen: false }) }
};
