/** A slice of a longer list plus what's needed to page through it. */
export type Page<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};
