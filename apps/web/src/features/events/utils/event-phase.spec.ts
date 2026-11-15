import { makeEvent, scheduledEvent } from '@/shared/test/fixtures/events';
import {
  canUnpublish,
  describePhase,
  formatLocalDateTime,
  nowInZone
} from './event-phase';

describe('describePhase', () => {
  it('says when a scheduled event goes live, in its own time zone', () => {
    expect(describePhase(scheduledEvent)).toBe('Goes live Sun, 1 Sept, 10:00');
  });

  it('says until when a live event is listed, and when it expired', () => {
    const expiresAt = '2030-09-03T06:30:00.000Z';
    expect(describePhase(makeEvent({ expiresAt }))).toBe(
      'Listed until Tue, 3 Sept, 12:00'
    );
    expect(describePhase(makeEvent({ phase: 'EXPIRED', expiresAt }))).toBe(
      'Listing ended Tue, 3 Sept, 12:00'
    );
  });

  it('has nothing to add without times', () => {
    expect(describePhase(makeEvent())).toBeNull();
  });
});

describe('publishing helpers', () => {
  it('reads wall-clock time in another zone', () => {
    const instant = new Date('2030-09-01T04:30:00.000Z');
    expect(nowInZone('Asia/Kolkata', instant)).toBe('2030-09-01T10:00');
    expect(nowInZone('UTC', instant)).toBe('2030-09-01T04:30');
  });

  it('formats a wall-clock value without shifting it', () => {
    expect(formatLocalDateTime('2030-09-01T10:00')).toBe('Sun, 1 Sept, 10:00');
  });

  it('allows unpublishing only before anyone registers', () => {
    expect(canUnpublish(makeEvent({ registeredCount: 0 }))).toBe(true);
    expect(canUnpublish(makeEvent())).toBe(false);
  });
});
