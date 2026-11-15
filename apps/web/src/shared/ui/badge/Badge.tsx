import React, { type ReactNode } from 'react';
import { StyledBadge } from './styles';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export type BadgeProps = {
  tone?: BadgeTone;
  children: ReactNode;
};

export const Badge = ({ tone = 'neutral', children }: BadgeProps) => (
  <StyledBadge $tone={tone}>{children}</StyledBadge>
);
