import { z } from 'zod';
import {
  capacity,
  category,
  cityId,
  description,
  eventType,
  imageIds,
  onlineUrl,
  expiresAtLocal,
  priceMinor,
  publishAtLocal,
  slug,
  startsAtLocal,
  timeZone,
  title,
  venue,
  venueLocation
} from './fields';
import {
  refineSlotsOrSingleSession,
  refineSlotTimes,
  refineStartTime,
  refineTypeFields
} from './refinements';
import { slots } from './slots';
import { socialLinks } from './social-links';

export const updateEventSchema = z
  .object({
    title: title.optional(),
    description: description.optional(),
    eventType: eventType.optional(),
    category: category.optional(),
    slug: slug.optional(),
    startsAtLocal: startsAtLocal.optional(),
    timeZone: timeZone.optional(),
    venue: venue.optional(),
    cityId: cityId.nullable().optional(),
    /** `null` removes the pin (not allowed while the event is published). */
    venueLocation: venueLocation.nullable().optional(),
    onlineUrl: onlineUrl.optional(),
    capacity: capacity.optional(),
    priceMinor: priceMinor.optional(),
    socialLinks: socialLinks.optional(),
    imageIds: imageIds.optional(),
    publishAtLocal: publishAtLocal.optional(),
    expiresAtLocal: expiresAtLocal.optional(),
    /** Replaces all slots; `[]` turns the event back into one session. */
    slots: slots.optional()
  })
  .superRefine((value, ctx) => {
    if (Object.values(value).every((field) => field === undefined)) {
      ctx.addIssue({
        code: 'custom',
        message: 'There are no changes to save.'
      });
    }
    refineSlotsOrSingleSession(value, ctx, false);
    refineTypeFields(value, ctx, { partial: true });
    // A single-session start time and time zone only make sense together.
    const hasSlots = value.slots !== undefined && value.slots.length > 0;
    if (
      !hasSlots &&
      (value.startsAtLocal === undefined) !== (value.timeZone === undefined)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: [
          value.startsAtLocal === undefined ? 'startsAtLocal' : 'timeZone'
        ],
        message: 'Start date/time and time zone must be updated together.'
      });
    }
    refineStartTime(value, ctx);
    refineSlotTimes(value, ctx);
  });

export type UpdateEventInput = z.infer<typeof updateEventSchema>;
