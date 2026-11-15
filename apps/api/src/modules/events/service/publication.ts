import { withTransaction } from '../../../db/pool';
import { AppError, ErrorCode } from '../../../errors/app-error';
import type { AuthUser } from '../../auth/types';
import { publishDraft, unpublishEvent as unpublishRow } from '../repository';
import type { EventDto } from '../types';
import { VENUE_PIN_REQUIRED } from '../schemas/messages';
import { auditIfAdmin, loadManagedEvent } from './access';
import { fieldErrors } from './errors';
import { reloadForStaff } from './queries';

const START_PASSED =
  'The start time has passed. Choose a future time to publish.';
const START_PASSED_SLOTS =
  'The first time slot has passed. Update the slots to publish.';

/**
 * Publishing. A draft becomes PUBLISHED; it is *live* straight away, or at
 * its go-live time when one is set (phase SCHEDULED until then). The
 * organizer or any admin can publish and unpublish; admin actions are
 * audited.
 */

export const publishEvent = async (
  user: AuthUser,
  eventId: string
): Promise<EventDto> => {
  await withTransaction(async (client) => {
    const event = await loadManagedEvent(client, eventId, user);
    const published = await publishDraft(client, eventId, user.id);
    if (!published) {
      if (event.status !== 'DRAFT') {
        throw AppError.conflict(
          ErrorCode.INVALID_STATUS_TRANSITION,
          `Only draft events can be published (this event is ${event.status.toLowerCase()}).`
        );
      }
      if (event.event_type !== 'ONLINE' && event.venue_latitude === null) {
        throw fieldErrors({ venueLocation: VENUE_PIN_REQUIRED });
      }
      if (event.starts_at.getTime() <= Date.now()) {
        // Point at the field to fix: the start time, or the slots.
        throw fieldErrors(
          event.slots.length > 0
            ? { slots: START_PASSED_SLOTS }
            : { startsAtLocal: START_PASSED }
        );
      }
      throw fieldErrors({
        expiresAtLocal:
          'The listing end time has passed. Update it before publishing.'
      });
    }
    await auditIfAdmin(client, user, event, 'PUBLISH_EVENT');
  });
  return reloadForStaff(eventId);
};

/**
 * Back to draft: hides a scheduled or live event. Refused once anyone holds
 * a place, because they would lose sight of their event; cancel it instead.
 */
export const unpublishEvent = async (
  user: AuthUser,
  eventId: string
): Promise<EventDto> => {
  await withTransaction(async (client) => {
    const event = await loadManagedEvent(client, eventId, user);
    const unpublished = await unpublishRow(client, eventId, user.id);
    if (!unpublished) {
      if (event.status !== 'PUBLISHED') {
        throw AppError.conflict(
          ErrorCode.INVALID_STATUS_TRANSITION,
          `Only published events can be unpublished (this event is ${event.status.toLowerCase()}).`
        );
      }
      throw AppError.conflict(
        ErrorCode.EVENT_HAS_REGISTRATIONS,
        `${event.registered_count} people have registered, so this event can't be unpublished. Cancel it instead.`,
        { registeredCount: event.registered_count }
      );
    }
    await auditIfAdmin(client, user, event, 'UNPUBLISH_EVENT');
  });
  return reloadForStaff(eventId);
};
