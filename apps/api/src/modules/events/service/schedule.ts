import type { SlotWrite } from '../repository';
import type { SlotInput, UpdateEventInput } from '../schemas';
import { toUtcInstant } from '../time';
import type { EventRow, EventWriteFields } from '../types';
import { fieldErrors, invalidStart } from './errors';

/** Converts slot wall-clock times in the event's zone to UTC instants. */
export const toSlotWrites = (slots: SlotInput[], zone: string): SlotWrite[] => {
  const errors: Record<string, string> = {};
  const writes = slots.map((slot, index) => {
    const startsAt = toUtcInstant(slot.startsAtLocal, zone);
    const endsAt = toUtcInstant(slot.endsAtLocal, zone);
    if (!startsAt) {
      errors[`slots.${index}.startsAtLocal`] =
        'This time does not exist in the selected time zone.';
    }
    if (!endsAt) {
      errors[`slots.${index}.endsAtLocal`] =
        'This time does not exist in the selected time zone.';
    }
    return {
      label: slot.label,
      startsAt: startsAt ?? new Date(0),
      endsAt: endsAt ?? new Date(0),
      capacity: slot.capacity
    };
  });
  if (Object.keys(errors).length > 0) {
    throw fieldErrors(errors);
  }
  return writes;
};

export const START_IN_PAST = 'Start time must be in the future.';
export const SLOT_START_IN_PAST = 'Slot start must be in the future.';

/**
 * A published event (or a draft being published) must start in the
 * future. Drafts may keep a past time while they are being edited: they
 * are private, and publishing checks again. `startsAt`/`slots` are the
 * values being written; `undefined` means unchanged.
 */
export const assertStartsInFuture = (
  startsAt: Date | undefined,
  slots: SlotWrite[] | undefined
) => {
  const now = Date.now();
  const errors: Record<string, string> = {};
  if (slots && slots.length > 0) {
    slots.forEach((slot, index) => {
      if (slot.startsAt.getTime() <= now) {
        errors[`slots.${index}.startsAtLocal`] = SLOT_START_IN_PAST;
      }
    });
  } else if (startsAt && startsAt.getTime() <= now) {
    errors.startsAtLocal = START_IN_PAST;
  }
  if (Object.keys(errors).length > 0) {
    throw fieldErrors(errors);
  }
};

/** With slots, the event starts at the earliest slot and holds their total. */
export const scheduleFromSlots = (slots: SlotWrite[]) => ({
  startsAt: new Date(Math.min(...slots.map((slot) => slot.startsAt.getTime()))),
  capacity: slots.reduce((total, slot) => total + slot.capacity, 0)
});

export type ScheduleUpdate = {
  fields: Pick<EventWriteFields, 'startsAt' | 'capacity'>;
  /** New slot list to write, when the slots change. */
  slots?: SlotWrite[];
};

/** Works out start time, capacity and slots after the update. */
export const resolveSchedule = (
  event: EventRow,
  input: UpdateEventInput
): ScheduleUpdate => {
  const zone = input.timeZone ?? event.time_zone;
  const hadSlots = event.slots.length > 0;

  if (input.slots !== undefined && input.slots.length > 0) {
    const slots = toSlotWrites(input.slots, zone);
    return { fields: scheduleFromSlots(slots), slots };
  }

  if (input.slots !== undefined && hadSlots) {
    // Back to a single session: the form must send its start and capacity.
    const missing: Record<string, string> = {};
    if (input.startsAtLocal === undefined) {
      missing.startsAtLocal = 'Start date and time is required.';
    }
    if (input.capacity === undefined) {
      missing.capacity = 'Capacity is required.';
    }
    if (Object.keys(missing).length > 0) {
      throw fieldErrors(missing);
    }
  } else if (
    hadSlots &&
    (input.capacity !== undefined || input.startsAtLocal !== undefined)
  ) {
    throw fieldErrors({
      ...(input.capacity === undefined
        ? {}
        : { capacity: 'Capacity is calculated from the time slots.' }),
      ...(input.startsAtLocal === undefined
        ? {}
        : { startsAtLocal: 'The start time comes from the time slots.' })
    });
  }

  const startsAt =
    input.startsAtLocal === undefined
      ? undefined
      : toUtcInstant(input.startsAtLocal, zone);
  if (startsAt === null) {
    throw invalidStart();
  }
  return {
    fields: { startsAt, capacity: input.capacity },
    slots: input.slots !== undefined && hadSlots ? [] : undefined
  };
};
