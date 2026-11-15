import styled from 'styled-components';
import type { AvatarSize } from './Avatar';

const SIZES: Record<AvatarSize, number> = { sm: 24, md: 32, lg: 44 };

export const StyledAvatar = styled.span.withConfig({
  displayName: 'Avatar'
})<{ $size: AvatarSize; $hue: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${({ $size }) => SIZES[$size]}px;
  height: ${({ $size }) => SIZES[$size]}px;
  border-radius: 50%;
  font-size: ${({ $size }) => SIZES[$size] * 0.4}px;
  font-weight: 600;
  color: hsl(${({ $hue }) => $hue} 45% 25%);
  background: hsl(${({ $hue }) => $hue} 60% 86%);
`;
