import { z } from 'zod';
import { capacity, localDateTime } from './fields';
import { MAX_SLOTS } from './limits';

const slot = z
  .object({
    label: z
      .string({ error: 'Slot name is required.' })
      .trim()
      .min(1, 'Slot name is required.')
      .max(80, 'Slot name must be 80 characters or fewer.'),
    startsAtLocal: localDateTime('Slot start is required.'),
    endsAtLocal: localDateTime('Slot end is required.'),
    capacity
  })
  .refine((value) => value.endsAtLocal > value.startsAtLocal, {
    message: 'End time must be after the start time.',
    path: ['endsAtLocal']
  });

export const slots = z
  .array(slot)
  .max(MAX_SLOTS, `Add up to ${MAX_SLOTS} time slots.`)
  .refine(
    (items) =>
      new Set(items.map((item) => item.startsAtLocal)).size === items.length,
    "Two slots can't start at the same time."
  );

export type SlotInput = z.infer<typeof slot>;
