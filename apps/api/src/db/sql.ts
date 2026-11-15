/** Small SQL helpers shared by repositories. */

/**
 * `%text%` for ILIKE with LIKE wildcards escaped, so a search for "50%" or
 * "a_b" matches literally. Always pass the result as a bound parameter.
 */
export const containsPattern = (text: string) =>
  `%${text.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
