import type { z } from 'zod';
import { isValidTimeZone, toUtcInstant } from '../time';
import type { SlotInput } from './slots';

/**
 * Cross-field rules shared by the create and update schemas. Each adds
 * zod issues on the offending field path so the form can highlight it.
 */

type StartFields = { startsAtLocal?: string; timeZone?: string };

/**
 * Adds a `startsAtLocal` issue when the start time doesn't exist in the
 * time zone (a DST gap). Whether it must be in the future depends on the
 * event's status, so the service checks that (`assertStartsInFuture`).
 */
export const refineStartTime = (value: StartFields, ctx: z.RefinementCtx) => {
  // An invalid time zone already has its own error; don't add a misleading
  // "time does not exist" message on top of it.
  if (
    !value.startsAtLocal ||
    !value.timeZone ||
    !isValidTimeZone(value.timeZone)
  ) {
    return;
  }
  const instant = toUtcInstant(value.startsAtLocal, value.timeZone);
  if (!instant) {
    ctx.addIssue({
      code: 'custom',
      path: ['startsAtLocal'],
      message: 'This time does not exist in the selected time zone.'
    });
  }
};

/** Checks each slot's wall-clock times exist in the event's time zone. */
export const refineSlotTimes = (
  value: { slots?: SlotInput[]; timeZone?: string },
  ctx: z.RefinementCtx
) => {
  if (!value.slots || !value.timeZone || !isValidTimeZone(value.timeZone)) {
    return;
  }
  const zone = value.timeZone;
  value.slots.forEach((item, index) => {
    (['startsAtLocal', 'endsAtLocal'] as const).forEach((field) => {
      const instant = toUtcInstant(item[field], zone);
      if (!instant) {
        ctx.addIssue({
          code: 'custom',
          path: ['slots', index, field],
          message: 'This time does not exist in the selected time zone.'
        });
      }
    });
  });
};

/**
 * Slots replace the event-level start time and capacity. Runs even when
 * other fields failed (`when: always`), so it only reads fields defensively.
 */
export const refineSlotsOrSingleSession = (
  value: { slots?: unknown; startsAtLocal?: unknown; capacity?: unknown },
  ctx: z.RefinementCtx,
  requireSingleSessionFields: boolean
) => {
  if (Array.isArray(value.slots) && value.slots.length > 0) {
    if (value.startsAtLocal !== undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['startsAtLocal'],
        message:
          'Omit the start time for events with time slots; it is taken from the slots.'
      });
    }
    if (value.capacity !== undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['capacity'],
        message:
          'Omit capacity for events with time slots; it is calculated from the slots.'
      });
    }
    return;
  }
  if (!requireSingleSessionFields) {
    return;
  }
  if (value.startsAtLocal === undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['startsAtLocal'],
      message: 'Start date and time is required.'
    });
  }
  if (value.capacity === undefined) {
    ctx.addIssue({
      code: 'custom',
      path: ['capacity'],
      message: 'Capacity is required.'
    });
  }
};

/**
 * Venue for in-person/hybrid events; a meeting link for online/hybrid.
 * Also runs when other fields failed, so it reads fields defensively.
 */
export const refineTypeFields = (
  value: { eventType?: unknown; venue?: unknown; onlineUrl?: unknown },
  ctx: z.RefinementCtx,
  { partial = false }: { partial?: boolean } = {}
) => {
  if (typeof value.eventType !== 'string') {
    return;
  }
  // In a partial update an omitted field keeps its stored value, which the
  // service checks; only fields actually sent are validated here.
  const venue = typeof value.venue === 'string' ? value.venue.trim() : '';
  const checkVenue = !partial || value.venue !== undefined;
  const checkLink = !partial || value.onlineUrl !== undefined;
  if (checkVenue && value.eventType !== 'ONLINE' && venue === '') {
    ctx.addIssue({
      code: 'custom',
      path: ['venue'],
      message: 'Venue is required.'
    });
  }
  if (checkLink && value.eventType !== 'IN_PERSON' && !value.onlineUrl) {
    ctx.addIssue({
      code: 'custom',
      path: ['onlineUrl'],
      message: 'Meeting link is required for online and hybrid events.'
    });
  }
};
