import { DateTime } from 'luxon';

/** Wall-clock input format used by `<input type="datetime-local">`. */
export const LOCAL_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export const isValidTimeZone = (zone: string): boolean =>
  DateTime.local().setZone(zone).isValid;

/**
 * Interprets a wall-clock time in the event's time zone and returns the UTC
 * instant. Returns `null` for invalid input, including times that do not
 * exist because of a daylight-saving jump.
 */
export const toUtcInstant = (
  localDateTime: string,
  zone: string
): Date | null => {
  if (!LOCAL_DATE_TIME_PATTERN.test(localDateTime) || !isValidTimeZone(zone)) {
    return null;
  }
  const zoned = DateTime.fromISO(localDateTime, { zone });
  if (!zoned.isValid) {
    return null;
  }
  // Luxon silently shifts non-existent DST times forward; reject them so the
  // organizer gets the time they typed or an error.
  if (zoned.toFormat("yyyy-MM-dd'T'HH:mm") !== localDateTime) {
    return null;
  }
  return zoned.toJSDate();
};

/** Formats a UTC instant as wall-clock input in the given zone. */
export const toLocalDateTime = (instant: Date, zone: string): string =>
  DateTime.fromJSDate(instant).setZone(zone).toFormat("yyyy-MM-dd'T'HH:mm");
