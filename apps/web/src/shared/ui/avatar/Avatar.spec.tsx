import { getInitials } from './Avatar';

describe('getInitials', () => {
  it('uses the first letters of up to two words', () => {
    expect(getInitials('olivia grace organizer')).toBe('OG');
    expect(getInitials('  Asha ')).toBe('A');
  });
});
