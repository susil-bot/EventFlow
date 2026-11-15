import { css } from 'styled-components';
import { Design } from './tokens';

/**
 * Editorial typography used across the app:
 * - `displayHeading`: high-contrast serif for page and card titles.
 * - `overline`: small, uppercase, widely tracked sans for labels, counts and
 *   buttons.
 * Use these instead of re-declaring fonts in components.
 */
export const displayHeading = css`
  font-family: var(${Design.Font.Display});
  font-weight: 400;
  letter-spacing: -0.01em;
  line-height: 1.1;
`;

export const overline = css`
  font-family: var(${Design.Font.Family});
  font-size: var(${Design.Font.SizeXs});
  font-weight: 500;
  letter-spacing: var(${Design.Font.TrackingWide});
  text-transform: uppercase;
`;
