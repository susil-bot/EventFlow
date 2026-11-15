import { formatRelativeTime } from './relative-time';

const now = new Date('2030-11-13T12:00:00.000Z');
const ago = (seconds: number) =>
  new Date(now.getTime() - seconds * 1000).toISOString();

describe('formatRelativeTime', () => {
  it('describes past and future times in the largest whole unit', () => {
    expect(formatRelativeTime(ago(20), now)).toBe('just now');
    expect(formatRelativeTime(ago(5 * 60), now)).toBe('5 minutes ago');
    expect(formatRelativeTime(ago(3 * 3600), now)).toBe('3 hours ago');
    expect(formatRelativeTime(ago(26 * 3600), now)).toBe('1 day ago');
    expect(formatRelativeTime(ago(-2 * 7 * 24 * 3600), now)).toBe('in 2 weeks');
  });
});
