import { randomBytes } from 'node:crypto';
import type { Queryable } from '../../../db/pool';
import { findTakenSlugs } from '../repository';

/** URL-safe slug from free text: lowercase, ASCII, single hyphens. */
const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');

/**
 * A readable, unused slug derived from the title: the plain title first,
 * then the title with a short random suffix. A rare race with another
 * request is still caught by the unique index (SLUG_TAKEN).
 */
export const generateSlug = async (db: Queryable, title: string) => {
  const base = slugify(title).length >= 3 ? slugify(title) : 'event';
  const candidates = [
    base,
    ...Array.from(
      { length: 4 },
      () => `${base}-${randomBytes(3).toString('hex')}`
    )
  ];
  const taken = await findTakenSlugs(db, candidates);
  return (
    candidates.find((candidate) => !taken.has(candidate)) ??
    `${base}-${randomBytes(6).toString('hex')}`
  );
};
