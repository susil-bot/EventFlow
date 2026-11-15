import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { ChipCount, StyledChip } from './styles';

export type ChipProps = {
  /** Shown filled and announced as pressed. */
  selected?: boolean;
  /** Optional count after the label, e.g. "Workshops 4". */
  count?: number;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children'>;

/** Toggle button for filters (categories, dates, formats, prices). */
export const Chip = ({
  selected = false,
  count,
  children,
  ...rest
}: ChipProps) => (
  <StyledChip
    type="button"
    aria-pressed={selected}
    $selected={selected}
    {...rest}
  >
    {children}
    {count === undefined ? null : <ChipCount>{count}</ChipCount>}
  </StyledChip>
);
