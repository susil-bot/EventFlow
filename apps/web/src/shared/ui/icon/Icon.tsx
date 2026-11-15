import React from 'react';
import { StyledSvg } from './styles';

const PATHS = {
  calendar:
    'M8 2v3M16 2v3M3.5 9h17M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V6A1.5 1.5 0 0 1 5 4.5Z',
  pin: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Zm0-8.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8.5v-.5a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v.5',
  users:
    'M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm10 9v-1.5a3.5 3.5 0 0 0-2.6-3.4M15.5 4.2a3.5 3.5 0 0 1 0 6.6',
  home: 'M3.5 10.5 12 3.5l8.5 7V20a.5.5 0 0 1-.5.5h-5v-6h-6v6H4a.5.5 0 0 1-.5-.5v-9.5Z',
  ticket:
    'M3.5 8V6.5A1.5 1.5 0 0 1 5 5h14a1.5 1.5 0 0 1 1.5 1.5V8a2.5 2.5 0 0 0 0 5v1.5A1.5 1.5 0 0 1 19 16H5a1.5 1.5 0 0 1-1.5-1.5V13a2.5 2.5 0 0 0 0-5Zm10-3v11',
  dashboard: 'M4 4h7v7H4V4Zm9 0h7v4h-7V4Zm0 6h7v10h-7V10ZM4 13h7v7H4v-7Z',
  plus: 'M12 5v14M5 12h14',
  logout:
    'M15 4h3.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H15M10 16l-4-4 4-4M6 12h10',
  chevronRight: 'm9 6 6 6-6 6',
  chevronDown: 'm6 9 6 6 6-6',
  chevronUp: 'm6 15 6-6 6 6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  hourglass:
    'M6.5 3h11M6.5 21h11M7.5 3v2.5a4.5 4.5 0 0 0 9 0V3M7.5 21v-2.5a4.5 4.5 0 0 1 9 0V21',
  liveCheck: 'M21 12a9 9 0 1 1-4.2-7.6M8.5 12l2.5 2.5 6-6',
  exit: 'M4 4v16M9 12h11m-4-4 4 4-4 4',
  external:
    'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  filter: 'M4 6h16M7 12h10M10 18h4',
  locate:
    'M12 18.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Zm0-3.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0-13v3.5M12 18.5V22M2 12h3.5M18.5 12H22',
  chevronLeft: 'm15 6-6 6 6 6',
  search: 'm20 20-4.2-4.2M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z',
  globe:
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  alert:
    'M12 8v5m0 3.5v.01M10.3 4.1 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 4.1a2 2 0 0 0-3.4 0Z',
  close: 'm6 6 12 12M18 6 6 18',
  edit: 'M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4',
  sparkle:
    'M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5m7 7L18 18M6 18l2.5-2.5m7-7L18 6',
  upload:
    'M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16',
  trash:
    'M4 7h16M9 7V4.5h6V7m-8.5 0 1 12.5A1.5 1.5 0 0 0 9 21h6a1.5 1.5 0 0 0 1.5-1.5l1-12.5',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  video:
    'M3.5 7.5A1.5 1.5 0 0 1 5 6h9a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 14 18H5a1.5 1.5 0 0 1-1.5-1.5v-9Zm12 3.5 5-3v8l-5-3',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4.5l3 2',
  tag: 'M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9-8-8Zm4.5-4.5v.01',
  x: 'M4 4h4.5L20 20h-4.5L4 4Zm16 0-6.8 7.6M4 20l6.8-7.6',
  linkedin:
    'M4.5 3.5h15a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1ZM8 10v7M8 7v.01M11.5 17v-7m0 3.5a2.5 2.5 0 0 1 5 0V17',
  instagram:
    'M7 3.5h10A3.5 3.5 0 0 1 20.5 7v10a3.5 3.5 0 0 1-3.5 3.5H7A3.5 3.5 0 0 1 3.5 17V7A3.5 3.5 0 0 1 7 3.5Zm5 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm5-9.5v.01',
  facebook:
    'M14 21v-8h3l.5-3.5H14V7.5C14 6.5 14.5 6 15.5 6H18V3h-3a4.5 4.5 0 0 0-4.5 4.5v2H8V13h2.5v8',
  youtube:
    'M3.5 8.5a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3v-7Zm7 1v5l4.5-2.5-4.5-2.5Z'
} as const;

export type IconName = keyof typeof PATHS;

export type IconProps = {
  name: IconName;
  size?: number;
  /** Accessible label. Omit for decorative icons. */
  title?: string;
  className?: string;
};

export const Icon = ({ name, size = 20, title, className }: IconProps) => (
  <StyledSvg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    role={title ? 'img' : undefined}
    aria-hidden={title ? undefined : true}
    aria-label={title}
    focusable="false"
  >
    <path d={PATHS[name]} />
  </StyledSvg>
);

export const ICON_NAMES = Object.keys(PATHS) as IconName[];
