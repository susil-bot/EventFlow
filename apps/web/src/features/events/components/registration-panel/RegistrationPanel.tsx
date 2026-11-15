import React, { type ReactNode, useState } from 'react';
import type {
  EventDto,
  EventSlot,
  RegistrationDto,
  User
} from '@/shared/api/types';
import { Avatar } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button, LinkButton } from '@/shared/ui/button';
import { formatSlotRange } from '../../utils/event-format';
import { describePhase } from '../../utils/event-phase';
import { Icon } from '@/shared/ui/icon';
import { CapacityMeter } from '../capacity-meter';
import {
  PanelBody,
  PanelConfirm,
  PanelHeader,
  PanelIdentity,
  PanelMessage,
  SlotChoice,
  SlotChoices,
  StyledPanel
} from './styles';

export type RegistrationPanelProps = {
  event: EventDto;
  viewer: User | null;
  /** The viewer's active registration for this event, if any. */
  registration?: RegistrationDto;
  /** Called with the chosen slot when the event has time slots. */
  onRegister: (slotId?: string) => void;
  onCancelRegistration: (registrationId: string) => void;
  isRegistering?: boolean;
  isCanceling?: boolean;
  /** Where to send signed-out visitors (keeps them on this event after login). */
  signInHref?: string;
};

type PanelContent = { message: ReactNode; action?: ReactNode };

const reasonSuffix = (event: EventDto) =>
  event.cancellationReason ? ` Reason: ${event.cancellationReason}` : '';

const registeredNote = (event: EventDto, registration: RegistrationDto) => {
  if (event.status === 'CANCELED') {
    return `but this event has been canceled.${reasonSuffix(event)}`;
  }
  return registration.slot
    ? `for ${registration.slot.label}. See you there!`
    : 'See you there!';
};

const slotAvailability = (slot: EventSlot) => {
  if (slot.hasStarted) {
    return 'Started';
  }
  return slot.availablePlaces === 0 ? 'Full' : `${slot.availablePlaces} left`;
};

type PanelState = {
  isConfirmingCancel: boolean;
  setIsConfirmingCancel: (value: boolean) => void;
  selectedSlotId?: string;
  setSelectedSlotId: (slotId: string) => void;
};

const getContent = (
  {
    event,
    viewer,
    registration,
    onRegister,
    onCancelRegistration,
    isRegistering = false,
    isCanceling = false,
    signInHref = '/login'
  }: RegistrationPanelProps,
  {
    isConfirmingCancel,
    setIsConfirmingCancel,
    selectedSlotId,
    setSelectedSlotId
  }: PanelState
): PanelContent => {
  if (registration?.status === 'ACTIVE') {
    const message = (
      <>
        <Badge tone="success">
          <Icon name="check" size={14} /> You&apos;re registered
        </Badge>{' '}
        {registeredNote(event, registration)}
      </>
    );
    if (event.hasStarted || event.status === 'CANCELED') {
      return { message };
    }
    if (isConfirmingCancel) {
      return {
        message,
        action: (
          <PanelConfirm role="group" aria-label="Confirm cancellation">
            <span>
              Cancel your registration? Your place will be released to other
              attendees.
            </span>
            <Button
              variant="danger"
              fullWidth
              isLoading={isCanceling}
              onClick={() => onCancelRegistration(registration.id)}
            >
              Yes, cancel registration
            </Button>
            <Button
              variant="ghost"
              fullWidth
              disabled={isCanceling}
              onClick={() => setIsConfirmingCancel(false)}
            >
              Keep my place
            </Button>
          </PanelConfirm>
        )
      };
    }
    return {
      message,
      action: (
        <Button
          variant="danger"
          fullWidth
          onClick={() => setIsConfirmingCancel(true)}
        >
          Cancel registration
        </Button>
      )
    };
  }
  if (event.status === 'CANCELED') {
    return {
      message: `This event has been canceled.${reasonSuffix(event)}`
    };
  }
  if (event.status === 'DRAFT') {
    return {
      message:
        'This event is not published yet and is not open for registration.'
    };
  }
  if (event.phase === 'SCHEDULED') {
    return {
      message: event.publishAt
        ? `This event isn't live yet. ${describePhase(event) ?? ''}`.trim()
        : "This event isn't live yet."
    };
  }
  if (event.hasStarted) {
    return {
      message: 'Registration has closed because the event has started.'
    };
  }
  if (event.phase === 'EXPIRED') {
    return { message: 'Registration for this event has closed.' };
  }
  if (event.availablePlaces === 0) {
    return {
      message:
        'This event is fully booked. A place may open up if someone cancels.'
    };
  }
  if (!viewer) {
    return {
      message: 'Sign in with an attendee account to register for this event.',
      action: (
        <LinkButton to={signInHref} variant="success" fullWidth size="lg">
          Sign in to register
        </LinkButton>
      )
    };
  }
  if (viewer.role === 'ORGANIZER') {
    return {
      message:
        viewer.id === event.organizerId
          ? 'You are the organizer of this event.'
          : 'Organizer accounts cannot register. Sign in as an attendee to join.',
      action:
        viewer.id === event.organizerId ? (
          <LinkButton
            to={`/organizer/events/${event.id}/attendees`}
            variant="secondary"
            fullWidth
          >
            View registrations
          </LinkButton>
        ) : undefined
    };
  }
  if (event.slots.length > 0) {
    return {
      message: 'Select a time slot to register.',
      action: (
        <>
          <SlotChoices>
            <legend>Time slot</legend>
            {event.slots.map((slot) => {
              const unavailable = slot.hasStarted || slot.availablePlaces === 0;
              return (
                <SlotChoice key={slot.id} $disabled={unavailable}>
                  <input
                    type="radio"
                    name={`slot-${event.id}`}
                    value={slot.id}
                    checked={selectedSlotId === slot.id}
                    disabled={unavailable}
                    onChange={() => setSelectedSlotId(slot.id)}
                  />
                  <span>
                    <strong>{slot.label}</strong>
                    <br />
                    {formatSlotRange(slot, event.timeZone)}
                  </span>
                  <small>{slotAvailability(slot)}</small>
                </SlotChoice>
              );
            })}
          </SlotChoices>
          <Button
            variant="success"
            size="lg"
            fullWidth
            isLoading={isRegistering}
            disabled={!selectedSlotId}
            onClick={() => onRegister(selectedSlotId)}
          >
            Register for this slot
          </Button>
        </>
      )
    };
  }
  return {
    message: 'Places are available. Reserve yours with one click.',
    action: (
      <Button
        variant="success"
        size="lg"
        fullWidth
        isLoading={isRegistering}
        onClick={() => onRegister()}
      >
        Register now
      </Button>
    )
  };
};

/** Luma-style registration card for the event detail page. */
export const RegistrationPanel = (props: RegistrationPanelProps) => {
  const { event, viewer } = props;
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string>();
  const { message, action } = getContent(props, {
    isConfirmingCancel,
    setIsConfirmingCancel,
    selectedSlotId,
    setSelectedSlotId
  });
  const showIdentity = viewer?.role === 'ATTENDEE' && action !== undefined;

  return (
    <StyledPanel aria-labelledby="registration-heading">
      <PanelHeader id="registration-heading">Registration</PanelHeader>
      <PanelBody>
        <PanelMessage>{message}</PanelMessage>
        {showIdentity && viewer ? (
          <PanelIdentity>
            <Avatar name={viewer.name} size="sm" />
            <strong>{viewer.name}</strong>
            <span>{viewer.email}</span>
          </PanelIdentity>
        ) : null}
        {action}
        <CapacityMeter
          registered={event.registeredCount}
          capacity={event.capacity}
        />
      </PanelBody>
    </StyledPanel>
  );
};
