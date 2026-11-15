export const queryKeys = {
  /** Prefix of every public listing; invalidate this after any change. */
  cities: ['cities'] as const,
  publicEvents: ['events', 'public'] as const,
  discover: (query: object) => ['events', 'public', query] as const,
  facets: (query: object) => ['events', 'public', 'facets', query] as const,
  eventDetails: ['events', 'detail'] as const,
  event: (idOrSlug: string) => ['events', 'detail', idOrSlug] as const,
  organizerEvents: ['organizer', 'events'] as const,
  attendees: (id: string) => ['organizer', 'events', id, 'attendees'] as const,
  myRegistrations: ['me', 'registrations'] as const,
  admin: ['admin'] as const,
  adminStats: ['admin', 'stats'] as const,
  adminUsers: (filters: object) => ['admin', 'users', filters] as const,
  adminEvents: (status?: string) =>
    ['admin', 'events', status ?? 'all'] as const,
  adminAudit: ['admin', 'audit'] as const
};
