import { isValidTimeZone, toLocalDateTime, toUtcInstant } from './time';

describe('event time helpers', () => {
  it('converts wall-clock time in a zone to the UTC instant', () => {
    const instant = toUtcInstant('2030-03-01T18:30', 'Asia/Kolkata');

    expect(instant?.toISOString()).toBe('2030-03-01T13:00:00.000Z');
  });

  it('round-trips an instant back to wall-clock time', () => {
    const instant = new Date('2030-07-01T17:00:00.000Z');

    expect(toLocalDateTime(instant, 'Europe/London')).toBe('2030-07-01T18:00');
  });

  it('rejects unknown time zones', () => {
    expect(isValidTimeZone('Mars/Olympus_Mons')).toBe(false);
    expect(toUtcInstant('2030-03-01T18:30', 'Mars/Olympus_Mons')).toBeNull();
  });

  it('rejects malformed input', () => {
    expect(toUtcInstant('01/03/2030 6pm', 'UTC')).toBeNull();
  });

  it('rejects times skipped by a daylight-saving jump', () => {
    // Clocks in New York jump from 02:00 to 03:00 on 2030-03-10.
    expect(toUtcInstant('2030-03-10T02:30', 'America/New_York')).toBeNull();
  });
});
