import styled, { css } from 'styled-components';
import { Design } from '@/shared/styles/tokens';
import { overline } from '@/shared/styles/typography';
import type { PhaseTone } from '../../utils/event-phase';

const TONE_COLOR: Record<PhaseTone, string> = {
  neutral: Design.Color.TextMuted,
  info: Design.Color.Info,
  success: Design.Color.Success,
  warning: Design.Color.Warning,
  danger: Design.Color.Danger
};

const TONE_SURFACE: Record<PhaseTone, string> = {
  neutral: Design.Color.SurfaceMuted,
  info: Design.Color.InfoSurface,
  success: Design.Color.SuccessSurface,
  warning: Design.Color.WarningSurface,
  danger: Design.Color.DangerSurface
};

export const StyledPhaseChip = styled.span.withConfig({
  displayName: 'PhaseChip'
})<{ $tone: PhaseTone; $variant: 'overlay' | 'inline' }>`
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  max-width: 100%;
  padding: var(${Design.Space.Xxs}) var(${Design.Space.Xs});
  border-left: 3px solid ${({ $tone }) => `var(${TONE_COLOR[$tone]})`};
  border-radius: var(${Design.Radius.Control});
  background: ${({ $tone }) => `var(${TONE_SURFACE[$tone]})`};
  color: var(${Design.Color.Text});

  ${({ $variant }) =>
    $variant === 'overlay' &&
    css`
      box-shadow: var(${Design.Shadow.Card});
      background: var(${Design.Color.Surface});
    `}
`;

export const ChipLabel = styled.span.withConfig({
  displayName: 'PhaseChipLabel'
})`
  ${overline}
`;

export const ChipDetail = styled.span.withConfig({
  displayName: 'PhaseChipDetail'
})`
  color: var(${Design.Color.TextMuted});
  font-size: var(${Design.Font.SizeXs});
`;
