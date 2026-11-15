import { dateRangeFor, isDateOption } from './date-ranges';

// Wednesday 13 November 2030, 15:30 local time.
const now = new Date(2030, 10, 13, 15, 30);

const local = (iso: string | undefined) => {
  const date = new Date(iso ?? '');
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours()
  ];
};

describe('dateRangeFor', () => {
  it('leaves the range open without a choice', () => {
    expect(dateRangeFor(null, now)).toEqual({});
  });

  it('starts at now and ends at a local midnight', () => {
    expect(dateRangeFor('today', now).startsAfter).toBe(now.toISOString());
    expect(local(dateRangeFor('today', now).startsBefore)).toEqual([
      2030, 11, 14, 0
    ]);
    expect(local(dateRangeFor('this-week', now).startsBefore)).toEqual([
      2030, 11, 18, 0
    ]);
    expect(local(dateRangeFor('this-month', now).startsBefore)).toEqual([
      2030, 12, 1, 0
    ]);
  });

  it('covers the whole of tomorrow', () => {
    const range = dateRangeFor('tomorrow', now);
    expect(local(range.startsAfter)).toEqual([2030, 11, 14, 0]);
    expect(local(range.startsBefore)).toEqual([2030, 11, 15, 0]);
  });

  it('covers Saturday and Sunday, starting now during the weekend', () => {
    const weekday = dateRangeFor('this-weekend', now);
    expect(local(weekday.startsAfter)).toEqual([2030, 11, 16, 0]);
    expect(local(weekday.startsBefore)).toEqual([2030, 11, 18, 0]);

    const sunday = new Date(2030, 10, 17, 10);
    const during = dateRangeFor('this-weekend', sunday);
    expect(during.startsAfter).toBe(sunday.toISOString());
    expect(local(during.startsBefore)).toEqual([2030, 11, 18, 0]);
  });

  it('treats Sunday as the last day of the week', () => {
    const sunday = new Date(2030, 10, 17, 10);
    expect(local(dateRangeFor('this-week', sunday).startsBefore)).toEqual([
      2030, 11, 18, 0
    ]);
  });

  it('recognises only known options', () => {
    expect(isDateOption('this-weekend')).toBe(true);
    expect(isDateOption('yesterday')).toBe(false);
    expect(isDateOption(null)).toBe(false);
  });
});
