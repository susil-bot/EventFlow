import React from 'react';
import { BadgeDay, BadgeMonth, StyledDateBadge } from './styles';

export type DateBadgeProps = {
  /** Short month, e.g. "SEP". */
  month: string;
  /** Day of month, e.g. "3". */
  day: string;
};

/** Calendar-tile date, decorative; pair it with a full written date. */
export const DateBadge = ({ month, day }: DateBadgeProps) => (
  <StyledDateBadge aria-hidden="true">
    <BadgeMonth>{month}</BadgeMonth>
    <BadgeDay>{day}</BadgeDay>
  </StyledDateBadge>
);
