import type { EventDto, EventRow, EventSlotDto } from '../events/types';

const REGISTRATION_STATUSES = ['ACTIVE', 'CANCELED'] as const;

export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export type RegistrationRow = {
  id: string;
  event_id: string;
  attendee_id: string;
  slot_id: string | null;
  status: RegistrationStatus;
  created_at: Date;
  canceled_at: Date | null;
};

/** A registration joined with its event; event columns are prefixed. */
export type RegistrationWithEventRow = {
  registration_id: string;
  registration_status: RegistrationStatus;
  registration_slot_id: string | null;
  registered_at: Date;
  canceled_at: Date | null;
} & EventRow;

export type RegistrationDto = {
  id: string;
  status: RegistrationStatus;
  registeredAt: string;
  canceledAt: string | null;
  /** The chosen time slot, when the event has slots. */
  slot: EventSlotDto | null;
  event: EventDto;
};
