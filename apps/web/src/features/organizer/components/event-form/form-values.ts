import type { FormEvent } from 'react';
import { getBrowserTimeZone } from '@/shared/utils/time-zones';
import type {
  EventFormInitialValues,
  EventFormIntent,
  EventFormProps
} from './types';
import type { EventFormValues } from './validation';

/** 39950 → "399.50", 39900 → "399". */
const formatRupees = (minor: number) =>
  minor % 100 === 0 ? String(minor / 100) : (minor / 100).toFixed(2);

const INTENTS: EventFormIntent[] = ['draft', 'publish', 'save'];

/** Reads the intent from the submit button that was pressed. */
export const getIntent = (
  event: FormEvent<HTMLFormElement>,
  mode: EventFormProps['mode']
): EventFormIntent => {
  const { submitter } = event.nativeEvent as SubmitEvent;
  const value = submitter?.getAttribute('value');
  const match = INTENTS.find((intent) => intent === value);
  return match ?? (mode === 'create' ? 'draft' : 'save');
};

/** Turns an existing event (or nothing) into editable form values. */
export const toFormValues = (
  initial: EventFormInitialValues = {}
): EventFormValues => ({
  title: initial.title ?? '',
  description: initial.description ?? '',
  eventType: initial.eventType ?? 'IN_PERSON',
  category: initial.category ?? '',
  slug: initial.slug ?? '',
  startsAtLocal: initial.startsAtLocal ?? '',
  timeZone: initial.timeZone ?? getBrowserTimeZone(),
  cityId: initial.city?.id ?? '',
  // Online events are stored with a placeholder venue; show it empty.
  venue:
    initial.eventType === 'ONLINE' && initial.venue === 'Online'
      ? ''
      : (initial.venue ?? ''),
  venueLocation: initial.venueLocation ?? null,
  onlineUrl: initial.onlineUrl ?? '',
  capacity:
    initial.capacity === undefined || (initial.slots?.length ?? 0) > 0
      ? ''
      : String(initial.capacity),
  price: initial.price ? formatRupees(initial.price.amountMinor) : '0',
  socialLinks: initial.socialLinks ?? [],
  images: initial.images ?? [],
  slots: (initial.slots ?? []).map((slot) => ({
    label: slot.label,
    startsAtLocal: slot.startsAtLocal,
    endsAtLocal: slot.endsAtLocal,
    capacity: String(slot.capacity)
  })),
  scheduleGoLive: Boolean(initial.publishAtLocal),
  publishAtLocal: initial.publishAtLocal ?? '',
  endListingEarly: Boolean(initial.expiresAtLocal),
  expiresAtLocal: initial.expiresAtLocal ?? '',
  isPublished: Boolean(initial.phase) && initial.phase !== 'DRAFT',
  goLiveLocked:
    initial.phase === 'LIVE' ||
    initial.phase === 'EXPIRED' ||
    initial.phase === 'ENDED'
});
