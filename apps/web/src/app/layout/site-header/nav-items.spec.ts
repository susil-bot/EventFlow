import {
  adminUser,
  attendeeUser,
  organizerUser,
  pendingOrganizerUser
} from '@/shared/test/fixtures/events';
import { getNavItems, isNavItemActive } from './nav-items';

const labels = (user: Parameters<typeof getNavItems>[0]) =>
  getNavItems(user, '/discover/events').map((item) => item.label);

describe('getNavItems', () => {
  it('shows links for each role', () => {
    expect(labels(null)).toEqual(['Events']);
    expect(labels(attendeeUser)).toEqual(['Events', 'My tickets']);
    expect(labels(organizerUser)).toEqual([
      'Events',
      'Dashboard',
      'Create event'
    ]);
    expect(labels(pendingOrganizerUser)).toEqual(['Events', 'Dashboard']);
    expect(labels(adminUser)).toEqual([
      'Events',
      'Overview',
      'Users',
      'All events'
    ]);
  });

  it('marks Events active on any Discover city page', () => {
    const [events] = getNavItems(null, '/discover/events-chennai');
    expect(isNavItemActive(events!, '/discover/events-pune')).toBe(true);
    expect(isNavItemActive(events!, '/events/react-meetup')).toBe(false);

    const [, overview, users] = getNavItems(adminUser, '/discover/events');
    expect(isNavItemActive(overview!, '/admin/users')).toBe(false);
    expect(isNavItemActive(users!, '/admin/users')).toBe(true);
  });
});
