import type { CreateEventInput, UpdateEventInput } from '../schemas';
import { toUtcInstant } from '../time';
import type { EventWriteFields } from '../types';
import {
  EXPIRY_AFTER_PUBLISH,
  EXPIRY_NOT_AFTER_START,
  fieldErrors,
  PUBLISH_BEFORE_START
} from './errors';

type PublishTimesInput = Pick<
  CreateEventInput | UpdateEventInput,
  'publishAtLocal' | 'expiresAtLocal'
>;

export type PublishTimesContext = {
  /** The event's time zone after this write. */
  zone: string;
  /** The event's start after this write. */
  startsAt: Date;
  /** Stored values, when editing an existing event. */
  current?: { publishAt: Date | null; expiresAt: Date | null; isLive: boolean };
  now?: Date;
};

const NONEXISTENT_TIME = 'This time does not exist in the selected time zone.';

/**
 * Validates the go-live and listing-end times and converts them from the
 * event's wall-clock time to UTC. Only the fields that were sent are
 * returned (`null` clears one). Checks run against the event's start after
 * this write, so moving the start also re-checks stored times.
 */
export const resolvePublishTimes = (
  input: PublishTimesInput,
  { zone, startsAt, current, now = new Date() }: PublishTimesContext
): Pick<EventWriteFields, 'publishAt' | 'expiresAt'> => {
  const errors: Record<string, string> = {};
  const parse = (
    local: string | null | undefined,
    field: 'publishAtLocal' | 'expiresAtLocal'
  ): Date | null | undefined => {
    if (local === undefined || local === null) {
      return local;
    }
    const instant = toUtcInstant(local, zone);
    if (!instant) {
      errors[field] = NONEXISTENT_TIME;
      return undefined;
    }
    return instant;
  };

  const publishAt = parse(input.publishAtLocal, 'publishAtLocal');
  const expiresAt = parse(input.expiresAtLocal, 'expiresAtLocal');

  if (publishAt) {
    if (current?.isLive) {
      errors.publishAtLocal =
        'This event is already live. Unpublish it to schedule it again.';
    } else if (publishAt.getTime() <= now.getTime()) {
      errors.publishAtLocal = 'The go-live time must be in the future.';
    }
  }
  if (expiresAt && expiresAt.getTime() <= now.getTime()) {
    errors.expiresAtLocal = 'The listing end must be in the future.';
  }

  // Compare the values that will be stored. A go-live time already in the
  // past no longer matters.
  const storedPublish =
    publishAt === undefined ? (current?.publishAt ?? null) : publishAt;
  const effectivePublish =
    storedPublish && storedPublish.getTime() > now.getTime()
      ? storedPublish
      : null;
  const effectiveExpiry =
    expiresAt === undefined ? (current?.expiresAt ?? null) : expiresAt;

  if (
    !errors.publishAtLocal &&
    effectivePublish &&
    effectivePublish.getTime() >= startsAt.getTime()
  ) {
    errors.publishAtLocal = PUBLISH_BEFORE_START;
  }
  if (!errors.expiresAtLocal && effectiveExpiry) {
    if (effectiveExpiry.getTime() > startsAt.getTime()) {
      errors.expiresAtLocal = EXPIRY_NOT_AFTER_START;
    } else if (
      effectivePublish &&
      effectiveExpiry.getTime() <= effectivePublish.getTime()
    ) {
      errors.expiresAtLocal = EXPIRY_AFTER_PUBLISH;
    }
  }
  if (Object.keys(errors).length > 0) {
    throw fieldErrors(errors);
  }
  return { publishAt, expiresAt };
};
