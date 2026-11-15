import styled, { keyframes } from 'styled-components';
import { visuallyHidden } from '@/shared/styles/visually-hidden';
import type { SpinnerSize } from './Spinner';

const SIZES: Record<SpinnerSize, number> = { sm: 14, md: 24, lg: 40 };

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const SpinnerRing = styled.span.withConfig({
  displayName: 'SpinnerRing'
})<{ $size: SpinnerSize }>`
  display: inline-block;
  width: ${({ $size }) => SIZES[$size]}px;
  height: ${({ $size }) => SIZES[$size]}px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  vertical-align: middle;
  animation: ${spin} 700ms linear infinite;
`;

export const SpinnerText = styled.span.withConfig({
  displayName: 'SpinnerText'
})`
  ${visuallyHidden}
`;
