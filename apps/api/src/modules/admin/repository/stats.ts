import { firstRow, type Queryable } from '../../../db/pool';
import { liveCondition } from '../../events/repository/columns';
import type { PlatformStats } from '../types';

type StatsRow = {
  organizers: number;
  attendees: number;
  admins: number;
  pending_organizers: number;
  suspended_users: number;
  draft_events: number;
  published_events: number;
  canceled_events: number;
  upcoming_published_events: number;
  active_registrations: number;
};

/** One round trip; each figure is a filtered aggregate. */
export const getPlatformStats = async (
  db: Queryable
): Promise<PlatformStats> => {
  const { rows } = await db.query<StatsRow>(`
    SELECT
      (SELECT count(*) FILTER (WHERE role = 'ORGANIZER') FROM users)::int AS organizers,
      (SELECT count(*) FILTER (WHERE role = 'ATTENDEE') FROM users)::int AS attendees,
      (SELECT count(*) FILTER (WHERE role = 'ADMIN') FROM users)::int AS admins,
      (SELECT count(*) FILTER (WHERE status = 'PENDING_APPROVAL') FROM users)::int AS pending_organizers,
      (SELECT count(*) FILTER (WHERE status = 'SUSPENDED') FROM users)::int AS suspended_users,
      (SELECT count(*) FILTER (WHERE status = 'DRAFT') FROM events)::int AS draft_events,
      (SELECT count(*) FILTER (WHERE status = 'PUBLISHED') FROM events)::int AS published_events,
      (SELECT count(*) FILTER (WHERE status = 'CANCELED') FROM events)::int AS canceled_events,
      (SELECT count(*) FILTER (WHERE ${liveCondition('events')})
         FROM events)::int AS upcoming_published_events,
      (SELECT count(*) FILTER (WHERE status = 'ACTIVE') FROM registrations)::int AS active_registrations
  `);
  const row = firstRow(rows, 'stats');
  return {
    users: {
      ORGANIZER: row.organizers,
      ATTENDEE: row.attendees,
      ADMIN: row.admins
    },
    pendingOrganizers: row.pending_organizers,
    suspendedUsers: row.suspended_users,
    events: {
      DRAFT: row.draft_events,
      PUBLISHED: row.published_events,
      CANCELED: row.canceled_events
    },
    upcomingPublishedEvents: row.upcoming_published_events,
    activeRegistrations: row.active_registrations
  };
};
