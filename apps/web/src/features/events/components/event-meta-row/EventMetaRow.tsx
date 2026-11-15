import React, { type ReactNode } from 'react';
import { Icon, type IconName } from '@/shared/ui/icon';
import {
  IconTile,
  MetaPrimary,
  MetaSecondary,
  MetaText,
  StyledRow
} from './styles';

export type EventMetaRowProps = {
  /** Icon shown in the tile, or a custom leading node (e.g. DateBadge). */
  icon?: IconName;
  leading?: ReactNode;
  primary: ReactNode;
  secondary?: ReactNode;
};

/** Luma-style row: square tile on the left, two lines of text on the right. */
export const EventMetaRow = ({
  icon,
  leading,
  primary,
  secondary
}: EventMetaRowProps) => (
  <StyledRow>
    {leading ?? (
      <IconTile>{icon ? <Icon name={icon} size={20} /> : null}</IconTile>
    )}
    <MetaText>
      <MetaPrimary>{primary}</MetaPrimary>
      {secondary ? <MetaSecondary>{secondary}</MetaSecondary> : null}
    </MetaText>
  </StyledRow>
);
