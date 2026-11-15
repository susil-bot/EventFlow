/**
 * Date choices on the Discover page, resolved in the visitor's own time
 * zone. `null` (no choice) means any upcoming date.
 */
export const DATE_OPTIONS = [
  'today',
  'tomorrow',
  'this-weekend',
  'this-week',
  'this-month'
] as const;
export type DateOption = (typeof DATE_OPTIONS)[number];

export const DATE_LABEL: Record<DateOption, string> = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  'this-weekend': 'This weekend',
  'this-week': 'This week',
  'this-month': 'This month'
};

export const isDateOption = (value: string | null): value is DateOption =>
  DATE_OPTIONS.some((option) => option === value);

const midnight = (date: Date, plusDays = 0) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + plusDays);

/** Days from `day` to the next Monday (1-7); getDay() is 0 on Sunday. */
const daysToMonday = (day: Date) => (8 - day.getDay()) % 7 || 7;

type Window = { start: Date; end: Date };

const windowFor = (option: DateOption, now: Date): Window => {
  switch (option) {
    case 'today':
      return { start: now, end: midnight(now, 1) };
    case 'tomorrow':
      return { start: midnight(now, 1), end: midnight(now, 2) };
    case 'this-weekend': {
      // Saturday and Sunday of this week; on a weekend, from now.
      const isWeekend = now.getDay() === 0 || now.getDay() === 6;
      const monday = midnight(now, daysToMonday(now));
      const saturday = midnight(monday, -2);
      return { start: isWeekend ? now : saturday, end: monday };
    }
    case 'this-week':
      return { start: now, end: midnight(now, daysToMonday(now)) };
    case 'this-month':
      return {
        start: now,
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      };
  }
};

/**
 * The instants the API filters on. Windows never start in the past and end
 * at a local midnight, so "this week" means "until Monday 00:00" wherever
 * the visitor is.
 */
export const dateRangeFor = (
  option: DateOption | null,
  now = new Date()
): { startsAfter?: string; startsBefore?: string } => {
  if (!option) {
    return {};
  }
  const { start, end } = windowFor(option, now);
  return { startsAfter: start.toISOString(), startsBefore: end.toISOString() };
};
