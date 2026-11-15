import React from 'react';
import { StyledAvatar } from './styles';

export type AvatarSize = 'sm' | 'md' | 'lg';

export type AvatarProps = {
  name: string;
  size?: AvatarSize;
};

export const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

/** Deterministic hue so the same person always gets the same colour. */
export const getHue = (seed: string) => {
  const hash = [...seed].reduce(
    (acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0,
    7
  );
  // Golden-angle spacing spreads similar strings across the colour wheel.
  return Math.round((hash * 137.508) % 360);
};

export const Avatar = ({ name, size = 'md' }: AvatarProps) => (
  <StyledAvatar $size={size} $hue={getHue(name)} aria-hidden="true">
    {getInitials(name)}
  </StyledAvatar>
);
