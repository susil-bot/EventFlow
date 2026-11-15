import { z } from 'zod';
import { SLUG_PATTERN } from './limits';

export const eventIdParamsSchema = z.object({
  id: z.uuid('Invalid event id.')
});

/** Event pages can be opened by id or by their URL slug. */
export const eventRefParamsSchema = z.object({
  id: z
    .string()
    .trim()
    .toLowerCase()
    .refine(
      (value) =>
        z.uuid().safeParse(value).success ||
        (value.length >= 3 && value.length <= 80 && SLUG_PATTERN.test(value)),
      'Invalid event id.'
    )
});
