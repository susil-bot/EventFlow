import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';
import type { BadgeTone } from './Badge';

const TONES: Record<BadgeTone, { color: string; background: string }> = {
  success: {
    color: Design.Color.Success,
    background: Design.Color.SuccessSurface
  },
  warning: {
    color: Design.Color.Warning,
    background: Design.Color.WarningSurface
  },
  danger: {
    color: Design.Color.Danger,
    background: Design.Color.DangerSurface
  },
  info: { color: Design.Color.Info, background: Design.Color.InfoSurface },
  neutral: {
    color: Design.Color.TextMuted,
    background: Design.Color.SurfaceMuted
  }
};

export const StyledBadge = styled.span.withConfig({
  displayName: 'Badge'
})<{ $tone: BadgeTone }>`
  display: inline-flex;
  align-items: center;
  gap: var(${Design.Space.Xxs});
  padding: 2px 10px;
  border-radius: var(${Design.Radius.Sm});
  font-size: var(${Design.Font.SizeXs});
  font-weight: 600;
  line-height: 1.6;
  white-space: nowrap;
  color: var(${({ $tone }) => TONES[$tone].color});
  background: var(${({ $tone }) => TONES[$tone].background});
`;
