import {
  isPgError,
  pool,
  PG_UNIQUE_VIOLATION,
  type Queryable,
  withTransaction
} from '../../db/pool';
import { AppError, ErrorCode } from '../../errors/app-error';
import type { AuthUser } from '../auth/types';
import { phaseOf, toEventDto } from '../events/mappers';
import {
  countSlots,
  findEventById,
  findSlot,
  releasePlace,
  releaseSlot,
  tryReservePlace,
  tryReserveSlot
} from '../events/repository';
import type { EventRow } from '../events/types';
import {
  findRegistrationForUpdate,
  findRegistrationWithEvent,
  hasActiveRegistration,
  insertRegistration,
  listUpcomingForAttendee,
  markCanceled
} from './repository';
import type { RegistrationDto, RegistrationWithEventRow } from './types';

const toRegistrationDto = (
  row: RegistrationWithEventRow,
  now = new Date()
): RegistrationDto => {
  const isActive = row.registration_status === 'ACTIVE';
  // Attendees holding a place may see the meeting link.
  const event = toEventDto(row, now, { includeOnlineUrl: isActive });
  return {
    id: row.registration_id,
    status: row.registration_status,
    registeredAt: row.registered_at.toISOString(),
    canceledAt: row.canceled_at?.toISOString() ?? null,
    slot:
      event.slots.find((slot) => slot.id === row.registration_slot_id) ?? null,
    event
  };
};

const loadRegistration = async (id: string): Promise<RegistrationDto> => {
  const row = await findRegistrationWithEvent(pool, id);
  if (!row) {
    throw AppError.notFound(
      'Registration not found.',
      ErrorCode.REGISTRATION_NOT_FOUND
    );
  }
  return toRegistrationDto(row);
};

const alreadyRegistered = (): AppError =>
  AppError.conflict(
    ErrorCode.ALREADY_REGISTERED,
    'You are already registered for this event.'
  );

/** Explains why the atomic reservation did not take a place. */
const reservationFailure = (event: EventRow | undefined): AppError => {
  const now = new Date();
  // Not live yet: hidden from attendees, so it answers like a missing one.
  if (!event || ['DRAFT', 'SCHEDULED'].includes(phaseOf(event, now))) {
    return AppError.notFound('Event not found.', ErrorCode.EVENT_NOT_FOUND);
  }
  if (event.status === 'CANCELED') {
    return AppError.conflict(
      ErrorCode.EVENT_CANCELED,
      'This event has been canceled and is not accepting registrations.'
    );
  }
  if (event.starts_at.getTime() <= Date.now()) {
    return AppError.conflict(
      ErrorCode.EVENT_STARTED,
      'Registration has closed because this event has already started.'
    );
  }
  if (phaseOf(event, now) === 'EXPIRED') {
    return AppError.conflict(
      ErrorCode.EVENT_NOT_OPEN,
      'Registration for this event has closed.'
    );
  }
  if (event.registered_count >= event.capacity) {
    return AppError.conflict(
      ErrorCode.EVENT_FULL,
      'This event is fully booked.'
    );
  }
  return AppError.conflict(
    ErrorCode.EVENT_NOT_OPEN,
    'This event is not open for registration.'
  );
};

/** Explains why a time slot could not take the attendee. */
const slotFailure = async (
  client: Queryable,
  eventId: string,
  slotId: string
): Promise<AppError> => {
  const slot = await findSlot(client, slotId);
  if (!slot || slot.event_id !== eventId) {
    return AppError.notFound(
      "That time slot doesn't exist for this event.",
      ErrorCode.SLOT_NOT_FOUND
    );
  }
  if (slot.starts_at.getTime() <= Date.now()) {
    return AppError.conflict(
      ErrorCode.SLOT_STARTED,
      'This time slot has already started. Please choose another one.'
    );
  }
  return AppError.conflict(
    ErrorCode.SLOT_FULL,
    'This time slot is fully booked. Please choose another one.'
  );
};

/**
 * Registers an attendee in a single transaction:
 *   1. Atomically reserve a place on the event (conditional UPDATE,
 *      row-locked).
 *   2. If the event has time slots, atomically reserve a place in the
 *      chosen slot the same way (event row is always locked first).
 *   3. Insert the registration. The partial unique index rejects a second
 *      ACTIVE registration; the rollback then returns the reserved places.
 * Any failure rolls back every reservation made so far.
 */
export const register = async (
  user: AuthUser,
  eventId: string,
  slotId?: string
): Promise<RegistrationDto> => {
  const registrationId = await withTransaction(async (client) => {
    // Someone already holding a place should hear that, not "full".
    // Read-only explanations; nothing is written on these paths.
    const explain = async (fallback: () => Promise<AppError>) => {
      if (await hasActiveRegistration(client, eventId, user.id)) {
        return alreadyRegistered();
      }
      return fallback();
    };

    const reserved = await tryReservePlace(client, eventId);
    if (!reserved) {
      const event = await findEventById(client, eventId);
      throw event?.status === 'PUBLISHED'
        ? await explain(async () => reservationFailure(event))
        : reservationFailure(event);
    }

    const hasSlots = (await countSlots(client, eventId)) > 0;
    if (hasSlots && !slotId) {
      throw await explain(
        async () =>
          new AppError(400, ErrorCode.SLOT_REQUIRED, 'Choose a time slot.', {
            fields: { slotId: 'Choose a time slot.' }
          })
      );
    }
    if (!hasSlots && slotId) {
      throw AppError.badRequest('This event has no time slots.', {
        fields: { slotId: 'This event has no time slots.' }
      });
    }
    if (slotId && !(await tryReserveSlot(client, eventId, slotId))) {
      throw await explain(() => slotFailure(client, eventId, slotId));
    }

    return insertRegistration(client, eventId, user.id, slotId ?? null);
  }).catch((error: unknown) => {
    if (isPgError(error, PG_UNIQUE_VIOLATION)) {
      throw alreadyRegistered();
    }
    throw error;
  });

  return loadRegistration(registrationId);
};

/** Cancels the attendee's own active registration and frees the place. */
export const cancelRegistration = async (
  user: AuthUser,
  registrationId: string
): Promise<RegistrationDto> => {
  await withTransaction(async (client) => {
    const registration = await findRegistrationForUpdate(
      client,
      registrationId
    );
    // Someone else's registration is reported as missing, not forbidden,
    // so registration ids can't be probed.
    if (!registration || registration.attendee_id !== user.id) {
      throw AppError.notFound(
        'Registration not found.',
        ErrorCode.REGISTRATION_NOT_FOUND
      );
    }
    const event = await findEventById(client, registration.event_id);
    if (event && event.starts_at.getTime() <= Date.now()) {
      throw AppError.conflict(
        ErrorCode.EVENT_STARTED,
        'Registrations cannot be canceled after the event has started.'
      );
    }
    const canceled = await markCanceled(client, registrationId);
    if (!canceled) {
      throw AppError.conflict(
        ErrorCode.REGISTRATION_NOT_ACTIVE,
        'This registration is already canceled.'
      );
    }
    await releasePlace(client, registration.event_id);
    if (registration.slot_id) {
      await releaseSlot(client, registration.slot_id);
    }
  });

  return loadRegistration(registrationId);
};

export const listMyUpcomingRegistrations = async (
  user: AuthUser
): Promise<RegistrationDto[]> => {
  const now = new Date();
  const rows = await listUpcomingForAttendee(pool, user.id);
  return rows.map((row) => toRegistrationDto(row, now));
};
