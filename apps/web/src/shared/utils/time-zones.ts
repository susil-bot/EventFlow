/** Common zones that are always offered, even if the browser lists aliases. */
const COMMON_ZONES = [
  'UTC',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles'
];

type IntlWithZones = typeof Intl & {
  supportedValuesOf?: (key: 'timeZone') => string[];
};

/**
 * IANA time zones for the picker: UTC first, then everything the browser
 * supports plus common zones (browsers report some zones by legacy alias,
 * e.g. `Asia/Calcutta`), plus any `include` values such as the zone an
 * existing event was saved with, so it is never silently replaced.
 */
export const getTimeZones = (include: string[] = []): string[] => {
  const supported =
    (Intl as IntlWithZones).supportedValuesOf?.('timeZone') ?? [];
  const rest = new Set([...supported, ...COMMON_ZONES, ...include]);
  rest.delete('UTC');
  return ['UTC', ...[...rest].filter(Boolean).sort()];
};

export const getBrowserTimeZone = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
