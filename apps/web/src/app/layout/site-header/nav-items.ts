import type { User } from '@/shared/api/types';

export type NavItem = {
  to: string;
  label: string;
  /** Active only on this exact path (default: the path and below). */
  end?: boolean;
  /** Path prefix that marks the item active, when `to` varies. */
  activePrefix?: string;
};

/**
 * Second header row. Links depend on the role; the API still enforces
 * access. `discoverTo` is Discover for the visitor's city.
 */
export const getNavItems = (
  user: User | null,
  discoverTo: string
): NavItem[] => {
  const events: NavItem = {
    to: discoverTo,
    label: 'Events',
    activePrefix: '/discover'
  };
  switch (user?.role) {
    case 'ADMIN':
      return [
        events,
        { to: '/admin', label: 'Overview', end: true },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/events', label: 'All events' }
      ];
    case 'ORGANIZER':
      return user.status === 'PENDING_APPROVAL'
        ? [events, { to: '/organizer', label: 'Dashboard', end: true }]
        : [
            events,
            { to: '/organizer', label: 'Dashboard', end: true },
            { to: '/organizer/events/new', label: 'Create event' }
          ];
    case 'ATTENDEE':
      return [events, { to: '/my/registrations', label: 'My tickets' }];
    default:
      return [events];
  }
};

export const isNavItemActive = (item: NavItem, pathname: string) => {
  const prefix = item.activePrefix ?? item.to;
  return item.end
    ? pathname === prefix
    : pathname === prefix || pathname.startsWith(`${prefix}/`);
};
