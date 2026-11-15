import {
  formatEventDay,
  getAvailability,
  getDateBadgeParts
} from './event-format';

const base = {
  status: 'PUBLISHED' as const,
  hasStarted: false,
  availablePlaces: 10,
  capacity: 10
};

describe('getAvailability', () => {
  it('shows remaining places', () => {
    expect(getAvailability(base)).toEqual({
      label: '10 places left',
      tone: 'success'
    });
  });

  it('warns when few places remain', () => {
    expect(getAvailability({ ...base, availablePlaces: 1 })).toEqual({
      label: '1 place left',
      tone: 'warning'
    });
  });

  it('marks full, started and canceled events', () => {
    expect(getAvailability({ ...base, availablePlaces: 0 }).label).toBe(
      'Sold out'
    );
    expect(getAvailability({ ...base, hasStarted: true }).label).toBe(
      'Registration closed'
    );
    expect(getAvailability({ ...base, status: 'CANCELED' }).label).toBe(
      'Canceled'
    );
  });
});

describe('date formatting', () => {
  it("formats in the event's time zone, not the browser's", () => {
    // 20:00 UTC on Mar 1 is already Mar 2 in Kolkata.
    const event = {
      startsAt: '2030-03-01T20:00:00.000Z',
      timeZone: 'Asia/Kolkata'
    };

    expect(formatEventDay(event)).toBe('Saturday, March 2, 2030');
    expect(getDateBadgeParts(event)).toEqual({ month: 'MAR', day: '2' });
  });
});
