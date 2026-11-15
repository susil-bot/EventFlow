import type { Queryable } from '../../../db/pool';
import { AppError, ErrorCode } from '../../../errors/app-error';
import { insertAuditEntry } from '../../admin/repository/audit';
import type { AdminAction } from '../../admin/types';
import type { AuthUser } from '../../auth/types';
import { countOwnedUploads } from '../../uploads/repository';
import { findEventById } from '../repository';
import type { EventRow } from '../types';
import { eventNotFound } from './errors';

/**
 * Loads an event the user organises. Someone else's event answers 404, the
 * same as a missing one, so ids can't be probed to learn what exists.
 */
export const loadOwnedEvent = async (
  db: Queryable,
  eventId: string,
  user: AuthUser
): Promise<EventRow> => {
  const event = await findEventById(db, eventId);
  if (!event || event.organizer_id !== user.id) {
    throw eventNotFound();
  }
  return event;
};

/**
 * Loads an event the user may manage: its organizer, or any admin. Anyone
 * else gets 404, like a missing event.
 */
export const loadManagedEvent = async (
  db: Queryable,
  eventId: string,
  user: AuthUser
): Promise<EventRow> => {
  const event = await findEventById(db, eventId);
  if (!event || (event.organizer_id !== user.id && user.role !== 'ADMIN')) {
    throw eventNotFound();
  }
  return event;
};

/**
 * Records a change an admin made to an organizer's event, in the same
 * transaction as the change. Organizers acting on their own events are not
 * audited.
 */
export const auditIfAdmin = async (
  db: Queryable,
  user: AuthUser,
  event: EventRow,
  action: AdminAction,
  metadata: Record<string, unknown> = {}
) => {
  if (user.role !== 'ADMIN') {
    return;
  }
  await insertAuditEntry(db, {
    adminId: user.id,
    action,
    targetType: 'EVENT',
    targetId: event.id,
    metadata: {
      title: event.title,
      organizerId: event.organizer_id,
      ...metadata
    }
  });
};

/**
 * Canceled events, and published events that have started, are read-only.
 * A draft stays editable whatever its start time, so a stale date can be
 * fixed before publishing.
 */
export const assertEditable = (event: EventRow) => {
  if (event.status === 'CANCELED') {
    throw AppError.conflict(
      ErrorCode.EVENT_NOT_EDITABLE,
      'Canceled events cannot be edited.'
    );
  }
  if (event.status === 'PUBLISHED' && event.starts_at.getTime() <= Date.now()) {
    throw AppError.conflict(
      ErrorCode.EVENT_NOT_EDITABLE,
      'Events that have already started cannot be edited.'
    );
  }
};

/**
 * Rejects image ids that don't exist or weren't uploaded by the event's
 * organizer (an admin editing the event can reorder or remove them, not
 * attach someone else's).
 */
export const assertImagesOwned = async (
  db: Queryable,
  imageIds: string[],
  organizerId: string
) => {
  if (imageIds.length === 0) {
    return;
  }
  const owned = await countOwnedUploads(db, imageIds, organizerId);
  if (owned !== imageIds.length) {
    throw AppError.badRequest(
      'One of the images could not be found. Please upload it again.',
      {
        fields: {
          imageIds:
            'One of the images could not be found. Please upload it again.'
        }
      }
    );
  }
};
