import type { EventDto, EventPhase } from '@/shared/api/types';

/** Labels and colours for the organizer/admin status chip. */
export const PHASE_LABEL: Record<EventPhase, string> = {
  DRAFT: 'Draft',
  SCHEDULED: 'Scheduled',
  LIVE: 'Live',
  EXPIRED: 'Expired',
  ENDED: 'Ended',
  CANCELED: 'Canceled'
};

export type PhaseTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export const PHASE_TONE: Record<EventPhase, PhaseTone> = {
  DRAFT: 'neutral',
  SCHEDULED: 'info',
  LIVE: 'success',
  EXPIRED: 'warning',
  ENDED: 'neutral',
  CANCELED: 'danger'
};

type PhaseInput = Pick<
  EventDto,
  'phase' | 'publishAt' | 'expiresAt' | 'timeZone'
>;

/** "Tue, 18 Nov, 10:00" in the event's own time zone. */
const formatPhaseTime = (iso: string, timeZone: string) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date(iso));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? '';
  return `${part('weekday')}, ${part('day')} ${part('month')}, ${part('hour')}:${part('minute')}`;
};

/**
 * The detail line under the status: when a scheduled event goes live, or
 * until when a live event stays listed. Uses times only staff receive.
 */
export const describePhase = ({
  phase,
  publishAt,
  expiresAt,
  timeZone
}: PhaseInput): string | null => {
  if (phase === 'SCHEDULED' && publishAt) {
    return `Goes live ${formatPhaseTime(publishAt, timeZone)}`;
  }
  if (phase === 'DRAFT' && publishAt) {
    return `Will go live ${formatPhaseTime(publishAt, timeZone)} once published`;
  }
  if ((phase === 'LIVE' || phase === 'SCHEDULED') && expiresAt) {
    return `Listed until ${formatPhaseTime(expiresAt, timeZone)}`;
  }
  if (phase === 'EXPIRED' && expiresAt) {
    return `Listing ended ${formatPhaseTime(expiresAt, timeZone)}`;
  }
  return null;
};

/**
 * Published (scheduled, live or expired), not started, and nobody has
 * registered: it can go back to draft. After that, cancel instead.
 */
export const canUnpublish = (
  event: Pick<EventDto, 'status' | 'hasStarted' | 'registeredCount'>
) =>
  event.status === 'PUBLISHED' &&
  !event.hasStarted &&
  event.registeredCount === 0;

/** Wall-clock "now" in a time zone, as `yyyy-MM-ddTHH:mm`. */
export const nowInZone = (timeZone: string, now = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
};

/** "Tue, 18 Nov, 10:00" for a wall-clock `yyyy-MM-ddTHH:mm` value. */
export const formatLocalDateTime = (local: string) => {
  const [date = '', time = ''] = local.split('T');
  const [year, month, day] = date.split('-').map(Number);
  const asUtc = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
  const weekday = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    timeZone: 'UTC'
  }).format(asUtc);
  const monthName = new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    timeZone: 'UTC'
  }).format(asUtc);
  return `${weekday}, ${day} ${monthName}, ${time}`;
};

/**
 * Short go-live label for lists: "Today 10:00", "Tomorrow", or
 * "15 Nov 2026", in the event's time zone.
 */
export const formatGoLiveShort = (
  iso: string,
  timeZone: string,
  now = new Date()
) => {
  const day = (date: Date) =>
    new Intl.DateTimeFormat('en-CA', { timeZone }).format(date);
  const target = new Date(iso);
  if (day(target) === day(now)) {
    const time = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).format(target);
    return `Today ${time}`;
  }
  if (day(target) === day(new Date(now.getTime() + 24 * 3600 * 1000))) {
    return 'Tomorrow';
  }
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(target);
};
