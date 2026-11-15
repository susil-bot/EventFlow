/** Request schemas for the events module (validated at the route boundary). */
export { createEventSchema, type CreateEventInput } from './create-event';
export {
  discoverEventsQuerySchema,
  eventFacetsQuerySchema,
  type DiscoverEventsQuery,
  type EventFacetsQuery,
  type EventSort
} from './discovery';
export * from './limits';
export { eventIdParamsSchema, eventRefParamsSchema } from './params';
export type { SlotInput } from './slots';
export { updateEventSchema, type UpdateEventInput } from './update-event';
