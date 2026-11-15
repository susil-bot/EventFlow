import { pool, withTransaction } from '../../../db/pool';
import { AppError, ErrorCode } from '../../../errors/app-error';
import type { AuthUser } from '../../auth/types';
import { toEventDto } from '../../events/mappers';
import { STAFF_VIEW } from '../../events/service/queries';
import { findEventById } from '../../events/repository';
import type { EventDto } from '../../events/types';
import {
  cancelEventWithReason,
  insertAuditEntry,
  listAllEvents
} from '../repository';
import type { ListEventsQuery } from '../schemas';

const eventNotFound = () =>
  AppError.notFound('Event not found.', ErrorCode.EVENT_NOT_FOUND);

export const listEventsForAdmin = async ({
  status
}: ListEventsQuery): Promise<EventDto[]> => {
  const now = new Date();
  const rows = await listAllEvents(pool, status);
  return rows.map((row) => toEventDto(row, now, STAFF_VIEW));
};

/**
 * Cancels any organizer's event (moderation). Registrations stay ACTIVE so
 * attendees see the event as canceled, with the reason, on their dashboard.
 */
export const cancelEventAsAdmin = async (
  admin: AuthUser,
  eventId: string,
  reason: string
): Promise<EventDto> => {
  await withTransaction(async (client) => {
    const event = await findEventById(client, eventId);
    if (!event) {
      throw eventNotFound();
    }
    const canceled = await cancelEventWithReason(
      client,
      eventId,
      reason,
      admin.id
    );
    if (!canceled) {
      throw AppError.conflict(
        ErrorCode.INVALID_STATUS_TRANSITION,
        'This event is already canceled.'
      );
    }
    await insertAuditEntry(client, {
      adminId: admin.id,
      action: 'CANCEL_EVENT',
      targetType: 'EVENT',
      targetId: eventId,
      reason,
      metadata: { title: event.title, organizerId: event.organizer_id }
    });
  });
  const event = await findEventById(pool, eventId);
  if (!event) {
    throw eventNotFound();
  }
  return toEventDto(event, new Date(), STAFF_VIEW);
};
