import React from 'react';
import { SpinnerRing, SpinnerText } from './styles';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export type SpinnerProps = {
  size?: SpinnerSize;
  /** Announced to screen readers. */
  label?: string;
};

export const Spinner = ({ size = 'md', label = 'Loading' }: SpinnerProps) => (
  <span role="status">
    <SpinnerRing $size={size} aria-hidden="true" />
    <SpinnerText>{label}</SpinnerText>
  </span>
);
