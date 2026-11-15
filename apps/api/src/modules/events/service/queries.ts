import { pool } from '../../../db/pool';
import type { AuthUser } from '../../auth/types';
import { phaseOf, toAttendeeDto, toEventDto } from '../mappers';
import {
  attendeeHasPlace,
  findEventById,
  findEventBySlug,
  listActiveAttendees,
  listByOrganizer
} from '../repository';
import type { AttendeeDto, EventDto } from '../types';
import { loadOwnedEvent } from './access';
import { eventNotFound } from './errors';

/** Read-side use cases: event pages and the organizer dashboard. */

/** What the organizer and admins see: meeting link and schedule. */
export const STAFF_VIEW = { includeOnlineUrl: true, includeStaffFields: true };

/** Reloads an event for its organizer or an admin. */
export const reloadForStaff = async (eventId: string): Promise<EventDto> => {
  const event = await findEventById(pool, eventId);
  if (!event) {
    throw eventNotFound();
  }
  return toEventDto(event, new Date(), STAFF_VIEW);
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Published and canceled events are public (canceled and expired ones are
 * shown as such to people who registered). Drafts and scheduled events
 * (not live yet) are visible only to their owner and to admins. The
 * meeting link is only shown to the owner, admins and attendees with a
 * place; the schedule only to the owner and admins.
 */
export const getEventForViewer = async (
  idOrSlug: string,
  viewer: AuthUser | undefined
): Promise<EventDto> => {
  const event = UUID_PATTERN.test(idOrSlug)
    ? await findEventById(pool, idOrSlug)
    : await findEventBySlug(pool, idOrSlug);
  const isOwner = event !== undefined && event.organizer_id === viewer?.id;
  const isStaff = isOwner || viewer?.role === 'ADMIN';
  const now = new Date();
  const phase = event ? phaseOf(event, now) : undefined;
  if (!event || ((phase === 'DRAFT' || phase === 'SCHEDULED') && !isStaff)) {
    throw eventNotFound();
  }
  const hasPlace =
    viewer?.role === 'ATTENDEE' &&
    (await attendeeHasPlace(pool, event.id, viewer.id));
  return toEventDto(event, now, {
    includeOnlineUrl: isStaff || hasPlace,
    includeStaffFields: isStaff
  });
};

export const listOrganizerEvents = async (
  user: AuthUser
): Promise<EventDto[]> => {
  const now = new Date();
  const rows = await listByOrganizer(pool, user.id);
  return rows.map((row) => toEventDto(row, now, STAFF_VIEW));
};

export const listEventAttendees = async (
  user: AuthUser,
  eventId: string
): Promise<{ event: EventDto; attendees: AttendeeDto[] }> => {
  // Ownership is verified before any attendee data is read.
  const event = await loadOwnedEvent(pool, eventId, user);
  const attendees = await listActiveAttendees(pool, eventId);
  return {
    event: toEventDto(event, new Date(), STAFF_VIEW),
    attendees: attendees.map(toAttendeeDto)
  };
};
