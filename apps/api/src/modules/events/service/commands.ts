import { pool, withTransaction } from '../../../db/pool';
import { AppError, ErrorCode } from '../../../errors/app-error';
import type { AuthUser } from '../../auth/types';
import {
  insertEvent,
  replaceImages,
  replaceSlots,
  type SlotWrite,
  transitionStatus,
  updateEventFields
} from '../repository';
import type { CreateEventInput, UpdateEventInput } from '../schemas';
import { toUtcInstant } from '../time';
import type { EventDto, EventWriteFields } from '../types';
import {
  assertEditable,
  assertImagesOwned,
  auditIfAdmin,
  loadManagedEvent,
  loadOwnedEvent
} from './access';
import { invalidStart, rethrowEventWriteError } from './errors';
import { resolveTypeFields, venueFor, venueLocationFields } from './event-type';
import { resolvePublishTimes } from './publish-times';
import { reloadForStaff } from './queries';
import {
  assertStartsInFuture,
  resolveSchedule,
  scheduleFromSlots,
  toSlotWrites
} from './schedule';
import { generateSlug } from './slug';

/**
 * Write-side use cases: create, edit and cancel events. Publishing lives in
 * `publication.ts`. Organizers manage their own events; admins can edit any
 * event, and every admin edit is audited.
 */

export const createEvent = async (
  user: AuthUser,
  input: CreateEventInput
): Promise<EventDto> => {
  const id = await withTransaction(async (client) => {
    await assertImagesOwned(client, input.imageIds, user.id);

    let startsAt: Date | null;
    let capacity: number;
    let slots: SlotWrite[] = [];
    if (input.slots.length > 0) {
      slots = toSlotWrites(input.slots, input.timeZone);
      ({ startsAt, capacity } = scheduleFromSlots(slots));
    } else {
      startsAt = toUtcInstant(input.startsAtLocal ?? '', input.timeZone);
      capacity = input.capacity ?? 0;
    }
    if (!startsAt) {
      throw invalidStart();
    }
    if (input.publish) {
      assertStartsInFuture(startsAt, slots);
    }
    const { publishAt, expiresAt } = resolvePublishTimes(input, {
      zone: input.timeZone,
      startsAt
    });

    const eventId = await insertEvent(client, {
      organizerId: user.id,
      title: input.title,
      description: input.description,
      startsAt,
      timeZone: input.timeZone,
      venue: venueFor(input.eventType, input.venue),
      capacity,
      status: input.publish ? 'PUBLISHED' : 'DRAFT',
      eventType: input.eventType,
      category: input.category,
      slug: input.slug ?? (await generateSlug(client, input.title)),
      onlineUrl:
        input.eventType === 'IN_PERSON' ? null : (input.onlineUrl ?? null),
      // Online events aren't tied to a city.
      cityId: input.eventType === 'ONLINE' ? null : (input.cityId ?? null),
      priceMinor: input.priceMinor,
      socialLinks: input.socialLinks,
      publishAt: publishAt ?? null,
      expiresAt: expiresAt ?? null,
      ...venueLocationFields(input.eventType, input.venueLocation)
    }).catch(rethrowEventWriteError);

    await replaceSlots(client, eventId, slots);
    await replaceImages(client, eventId, input.imageIds);
    return eventId;
  });
  return reloadForStaff(id);
};

export const updateEvent = async (
  user: AuthUser,
  eventId: string,
  input: UpdateEventInput
): Promise<EventDto> => {
  await withTransaction(async (client) => {
    const event = await loadManagedEvent(client, eventId, user);
    assertEditable(event);

    const typeFields = resolveTypeFields(event, input);
    const schedule = resolveSchedule(event, input);
    if (event.status === 'PUBLISHED') {
      assertStartsInFuture(schedule.fields.startsAt, schedule.slots);
    }
    const publishTimes = resolvePublishTimes(input, {
      zone: input.timeZone ?? event.time_zone,
      startsAt: schedule.fields.startsAt ?? event.starts_at,
      current: {
        publishAt: event.publish_at,
        expiresAt: event.expires_at,
        isLive:
          event.status === 'PUBLISHED' &&
          (!event.publish_at || event.publish_at.getTime() <= Date.now())
      }
    });
    if (input.imageIds !== undefined) {
      await assertImagesOwned(client, input.imageIds, event.organizer_id);
    }

    const changesSlots = schedule.slots !== undefined;
    const fields: EventWriteFields = {
      title: input.title,
      description: input.description,
      timeZone: input.timeZone,
      category: input.category,
      slug: input.slug,
      socialLinks: input.socialLinks,
      priceMinor: input.priceMinor,
      ...typeFields,
      ...schedule.fields,
      ...publishTimes
    };
    const hasColumnChanges = Object.values(fields).some(
      (value) => value !== undefined
    );

    if (hasColumnChanges || changesSlots) {
      const updated = await updateEventFields(client, eventId, fields, {
        editorId: user.id,
        requireNoRegistrations: changesSlots
      }).catch(rethrowEventWriteError);

      if (!updated) {
        // Re-read to explain why the guarded update did not apply.
        const current = await loadManagedEvent(client, eventId, user);
        assertEditable(current);
        if (changesSlots) {
          throw AppError.conflict(
            ErrorCode.SLOTS_LOCKED,
            `Time slots can't be changed once people have registered (${current.registered_count} registered).`,
            {
              fields: {
                slots:
                  "Time slots can't be changed once people have registered."
              },
              registeredCount: current.registered_count
            }
          );
        }
        throw AppError.conflict(
          ErrorCode.CAPACITY_BELOW_REGISTRATIONS,
          `Capacity cannot be lower than the current ${current.registered_count} active registrations.`,
          {
            fields: {
              capacity: `Must be at least ${current.registered_count}, the number of active registrations.`
            },
            registeredCount: current.registered_count
          }
        );
      }
    }

    if (schedule.slots !== undefined) {
      await replaceSlots(client, eventId, schedule.slots);
    }
    if (input.imageIds !== undefined) {
      await replaceImages(client, eventId, input.imageIds);
    }
    await auditIfAdmin(client, user, event, 'EDIT_EVENT', {
      fields: Object.keys(input).sort()
    });
  });
  return reloadForStaff(eventId);
};

export const cancelEvent = async (
  user: AuthUser,
  eventId: string
): Promise<EventDto> => {
  await loadOwnedEvent(pool, eventId, user);
  const moved = await transitionStatus(
    pool,
    eventId,
    ['DRAFT', 'PUBLISHED'],
    'CANCELED',
    user.id
  );
  if (!moved) {
    throw AppError.conflict(
      ErrorCode.INVALID_STATUS_TRANSITION,
      'This event is already canceled.'
    );
  }
  return reloadForStaff(eventId);
};
