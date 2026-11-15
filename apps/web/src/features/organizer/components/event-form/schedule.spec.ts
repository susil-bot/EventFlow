import type { FieldErrors } from '@/shared/api/types';
import {
  checkGoLive,
  checkListingEnd,
  describeListingWindow,
  firstStartOf,
  SCHEDULE_MESSAGES,
  type ScheduleValues,
  startHasPassed,
  validateSchedule
} from './schedule';

const NOW = new Date('2099-09-01T04:30:00.000Z'); // 10:00 in Kolkata

const VALUES: ScheduleValues = {
  startsAtLocal: '2099-09-03T18:00',
  timeZone: 'Asia/Kolkata',
  slots: [],
  scheduleGoLive: false,
  publishAtLocal: '',
  endListingEarly: false,
  expiresAtLocal: '',
  goLiveLocked: false,
  isPublished: false
};

const slot = (startsAtLocal: string) => ({
  label: 'Batch',
  startsAtLocal,
  endsAtLocal: '',
  capacity: '10'
});

describe('firstStartOf', () => {
  it('uses the start time, or the earliest slot', () => {
    expect(firstStartOf(VALUES)).toBe('2099-09-03T18:00');
    expect(
      firstStartOf({
        ...VALUES,
        slots: [slot('2099-09-05T10:00'), slot('2099-09-04T10:00')]
      })
    ).toBe('2099-09-04T10:00');
  });
});

describe('checkGoLive', () => {
  const context = {
    firstStart: '2099-09-03T18:00',
    timeZone: 'Asia/Kolkata',
    now: NOW
  };

  it('needs a time in the future, before the event starts', () => {
    expect(checkGoLive('', context)).toBe(SCHEDULE_MESSAGES.goLiveRequired);
    // 09:59 in Kolkata is already past at 10:00 Kolkata time.
    expect(checkGoLive('2099-09-01T09:59', context)).toBe(
      SCHEDULE_MESSAGES.goLiveInPast
    );
    expect(checkGoLive('2099-09-03T18:00', context)).toBe(
      SCHEDULE_MESSAGES.goLiveAfterStart
    );
    expect(checkGoLive('2099-09-01T10:30', context)).toBeUndefined();
  });
});

describe('checkListingEnd', () => {
  it('ends after go-live and no later than the start', () => {
    const context = {
      firstStart: '2099-09-03T18:00',
      goLive: '2099-09-02T10:00'
    };
    expect(checkListingEnd('', context)).toBe(
      SCHEDULE_MESSAGES.listingEndRequired
    );
    expect(checkListingEnd('2099-09-03T18:01', context)).toBe(
      SCHEDULE_MESSAGES.listingEndAfterStart
    );
    expect(checkListingEnd('2099-09-02T10:00', context)).toBe(
      SCHEDULE_MESSAGES.listingEndBeforeGoLive
    );
    expect(checkListingEnd('2099-09-03T18:00', context)).toBeUndefined();
  });
});

describe('validateSchedule', () => {
  it('only checks the times that are switched on', () => {
    const errors: FieldErrors = {};
    validateSchedule(VALUES, errors, { now: NOW });
    expect(errors).toEqual({});
  });

  it('skips the go-live time of a live event', () => {
    const errors: FieldErrors = {};
    validateSchedule(
      { ...VALUES, scheduleGoLive: true, goLiveLocked: true },
      errors,
      { now: NOW }
    );
    expect(errors).toEqual({});
  });

  it('reports both fields', () => {
    const errors: FieldErrors = {};
    validateSchedule(
      {
        ...VALUES,
        scheduleGoLive: true,
        publishAtLocal: '2099-09-04T10:00',
        endListingEarly: true,
        expiresAtLocal: ''
      },
      errors,
      { now: NOW }
    );
    expect(errors).toEqual({
      publishAtLocal: SCHEDULE_MESSAGES.goLiveAfterStart,
      expiresAtLocal: SCHEDULE_MESSAGES.listingEndRequired
    });
  });
});

describe('start times', () => {
  const past = { ...VALUES, startsAtLocal: '2099-09-01T09:00' };

  it('lets a draft keep a past start time', () => {
    const errors: FieldErrors = {};
    validateSchedule(past, errors, { now: NOW });
    expect(errors).toEqual({});
    expect(startHasPassed(past, NOW)).toBe(true);
  });

  it('needs a future start to publish a draft', () => {
    const errors: FieldErrors = {};
    validateSchedule(past, errors, { publishing: true, now: NOW });
    expect(errors).toEqual({
      startsAtLocal: SCHEDULE_MESSAGES.startPassedToPublish
    });
  });

  it('keeps a published event in the future, slots included', () => {
    const errors: FieldErrors = {};
    validateSchedule(
      {
        ...VALUES,
        isPublished: true,
        slots: [slot('2099-09-01T09:00'), slot('2099-09-05T10:00')]
      },
      errors,
      { now: NOW }
    );
    expect(errors).toEqual({
      'slots.0.startsAtLocal': SCHEDULE_MESSAGES.slotStartInPast
    });
  });
});

describe('describeListingWindow', () => {
  it('describes the default window', () => {
    expect(describeListingWindow(VALUES)).toBe(
      'Listed in Discover from the moment you publish until the event starts (Thu, 3 Sept, 18:00); registration closes then too. All times are in Asia/Kolkata.'
    );
  });

  it('describes a scheduled window', () => {
    expect(
      describeListingWindow({
        ...VALUES,
        scheduleGoLive: true,
        publishAtLocal: '2099-09-02T09:00',
        endListingEarly: true,
        expiresAtLocal: '2099-09-03T12:00'
      })
    ).toBe(
      'Listed in Discover from Wed, 2 Sept, 09:00 until Thu, 3 Sept, 12:00; registration closes then too. All times are in Asia/Kolkata.'
    );
  });
});
