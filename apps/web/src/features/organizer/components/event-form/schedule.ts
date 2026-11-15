import type { FieldErrors } from '@/shared/api/types';
import {
  formatLocalDateTime,
  nowInZone
} from '@/features/events/utils/event-phase';
import type { EventFormValues } from './validation';

/**
 * The event's timeline in one place: when it starts, when it goes live in
 * Discover and when the listing ends. All values are wall-clock strings
 * (`yyyy-MM-ddTHH:mm`) in the event's own time zone, so they compare in
 * order as plain strings. The form, the Publish dialog and the summary
 * line all use these rules, and the API applies the same ones again.
 */

export const SCHEDULE_MESSAGES = {
  startInPast: 'Start time must be in the future.',
  startPassedToPublish:
    'The start time has passed. Choose a future time to publish.',
  slotStartInPast: 'Slot start must be in the future.',
  startPassedDraftHint:
    "This time has passed. You can save the draft, but you'll need a future time to publish.",
  goLiveRequired: 'Choose when the event should go live.',
  goLiveInPast: 'The go-live time must be in the future.',
  goLiveAfterStart: 'The go-live time must be before the event starts.',
  listingEndRequired: 'Choose when the listing should end.',
  listingEndAfterStart: 'The listing must end no later than the event start.',
  listingEndBeforeGoLive: 'The listing must end after the go-live time.'
} as const;

export type ScheduleValues = Pick<
  EventFormValues,
  | 'startsAtLocal'
  | 'timeZone'
  | 'slots'
  | 'scheduleGoLive'
  | 'publishAtLocal'
  | 'endListingEarly'
  | 'expiresAtLocal'
  | 'goLiveLocked'
  | 'isPublished'
>;

/** The first start: the single start time, or the earliest time slot. */
export const firstStartOf = (
  values: Pick<ScheduleValues, 'slots' | 'startsAtLocal'>
): string =>
  values.slots.length > 0
    ? (values.slots
        .map((slot) => slot.startsAtLocal)
        .filter(Boolean)
        .sort()[0] ?? '')
    : values.startsAtLocal;

/** The go-live time the form will send ('' = goes live on publish). */
export const plannedGoLiveOf = (values: ScheduleValues): string =>
  values.scheduleGoLive && !values.goLiveLocked ? values.publishAtLocal : '';

/** The first start is at or before "now" in the event's time zone. */
export const startHasPassed = (
  values: Pick<ScheduleValues, 'slots' | 'startsAtLocal' | 'timeZone'>,
  now?: Date
): boolean => {
  const firstStart = firstStartOf(values);
  return Boolean(firstStart) && firstStart <= nowInZone(values.timeZone, now);
};

/**
 * Start times: a published event, or a draft being published, must start
 * in the future. A draft may keep a past time while it is being edited
 * (the form shows a hint instead), because it is private until published.
 */
const validateStartTimes = (
  values: ScheduleValues,
  errors: FieldErrors,
  publishing: boolean,
  now?: Date
) => {
  if (!publishing && !values.isPublished) {
    return;
  }
  const current = nowInZone(values.timeZone, now);
  if (values.slots.length > 0) {
    values.slots.forEach((slot, index) => {
      if (slot.startsAtLocal && slot.startsAtLocal <= current) {
        errors[`slots.${index}.startsAtLocal`] =
          SCHEDULE_MESSAGES.slotStartInPast;
      }
    });
    return;
  }
  if (values.startsAtLocal && values.startsAtLocal <= current) {
    errors.startsAtLocal = values.isPublished
      ? SCHEDULE_MESSAGES.startInPast
      : SCHEDULE_MESSAGES.startPassedToPublish;
  }
};

/** Checks a go-live time; returns the message to show, if any. */
export const checkGoLive = (
  goLive: string,
  context: { firstStart: string; timeZone: string; now?: Date }
): string | undefined => {
  if (!goLive) {
    return SCHEDULE_MESSAGES.goLiveRequired;
  }
  if (goLive <= nowInZone(context.timeZone, context.now)) {
    return SCHEDULE_MESSAGES.goLiveInPast;
  }
  if (context.firstStart && goLive >= context.firstStart) {
    return SCHEDULE_MESSAGES.goLiveAfterStart;
  }
  return undefined;
};

/** Checks an early listing end; returns the message to show, if any. */
export const checkListingEnd = (
  end: string,
  context: { firstStart: string; goLive: string }
): string | undefined => {
  if (!end) {
    return SCHEDULE_MESSAGES.listingEndRequired;
  }
  if (context.firstStart && end > context.firstStart) {
    return SCHEDULE_MESSAGES.listingEndAfterStart;
  }
  if (context.goLive && end <= context.goLive) {
    return SCHEDULE_MESSAGES.listingEndBeforeGoLive;
  }
  return undefined;
};

/** Adds start, go-live and listing-end errors to `errors`. */
export const validateSchedule = (
  values: ScheduleValues,
  errors: FieldErrors,
  { publishing = false, now }: { publishing?: boolean; now?: Date } = {}
) => {
  validateStartTimes(values, errors, publishing, now);
  const firstStart = firstStartOf(values);
  const goLive = plannedGoLiveOf(values);
  if (values.scheduleGoLive && !values.goLiveLocked) {
    const problem = checkGoLive(goLive, {
      firstStart,
      timeZone: values.timeZone,
      now
    });
    if (problem) {
      errors.publishAtLocal = problem;
    }
  }
  if (values.endListingEarly) {
    const problem = checkListingEnd(values.expiresAtLocal, {
      firstStart,
      goLive
    });
    if (problem) {
      errors.expiresAtLocal = problem;
    }
  }
};

/**
 * One sentence describing the listing window, e.g. "Listed in Discover
 * from the moment you publish until the event starts (Sun, 16 Nov, 16:00);
 * registration closes then too. All times are in Asia/Kolkata."
 */
export const describeListingWindow = (values: ScheduleValues): string => {
  const firstStart = firstStartOf(values);
  const goLive = plannedGoLiveOf(values);
  let from = 'the moment you publish';
  if (values.goLiveLocked) {
    from = 'now (already live)';
  } else if (goLive) {
    from = formatLocalDateTime(goLive);
  }
  let until = firstStart
    ? `the event starts (${formatLocalDateTime(firstStart)})`
    : 'the event starts';
  if (values.endListingEarly && values.expiresAtLocal) {
    until = formatLocalDateTime(values.expiresAtLocal);
  }
  return `Listed in Discover from ${from} until ${until}; registration closes then too. All times are in ${values.timeZone}.`;
};
