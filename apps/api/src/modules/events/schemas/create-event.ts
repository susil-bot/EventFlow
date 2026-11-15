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
import { VENUE_PIN_REQUIRED } from './messages';
import { socialLinks } from './social-links';

export const createEventSchema = z
  .object({
    title,
    description,
    eventType: eventType.default('IN_PERSON'),
    category,
    slug: slug.optional(),
    startsAtLocal: startsAtLocal.optional(),
    timeZone,
    venue: venue.default(''),
    /** Required for in-person and hybrid events; ignored for online ones. */
    cityId: cityId.nullable().optional(),
    /** Map pin; needed to publish an in-person or hybrid event. */
    venueLocation: venueLocation.nullable().optional(),
    onlineUrl: onlineUrl.optional(),
    capacity: capacity.optional(),
    priceMinor: priceMinor.default(0),
    socialLinks: socialLinks.default([]),
    imageIds: imageIds.default([]),
    slots: slots.default([]),
    publishAtLocal: publishAtLocal.optional(),
    expiresAtLocal: expiresAtLocal.optional(),
    publish: z.boolean().default(false)
  })
  // Required-field checks run even when other fields are invalid, so the
  // organizer sees every missing field at once.
  .superRefine(
    (value, ctx) => {
      refineSlotsOrSingleSession(value, ctx, true);
      refineTypeFields(value, ctx);
      if (
        value.publish === true &&
        value.eventType !== 'ONLINE' &&
        !value.venueLocation
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['venueLocation'],
          message: VENUE_PIN_REQUIRED
        });
      }
      if (value.eventType !== 'ONLINE' && !value.cityId) {
        ctx.addIssue({
          code: 'custom',
          path: ['cityId'],
          message: 'Choose the city where the event happens.'
        });
      }
    },
    { when: () => true }
  )
  .superRefine((value, ctx) => {
    if (value.slots.length === 0) {
      refineStartTime(value, ctx);
    }
    refineSlotTimes(value, ctx);
  });

export type CreateEventInput = z.infer<typeof createEventSchema>;
