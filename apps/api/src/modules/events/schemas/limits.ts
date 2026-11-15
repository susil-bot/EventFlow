import { SOCIAL_PLATFORMS } from '../types';

/** Validation limits shared by the event schemas. */
export const MAX_CAPACITY = 100_000;
export const MAX_SLOTS = 10;
export const MAX_IMAGES = 6;
export const MAX_SOCIAL_LINKS = SOCIAL_PLATFORMS.length;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// `facets` is an API route under /api/events.
export const RESERVED_SLUGS = new Set(['new', 'edit', 'create', 'facets']);
