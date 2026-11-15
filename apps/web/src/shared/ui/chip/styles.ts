import styled, { css } from 'styled-components';
import { Design } from '@/shared/styles/tokens';

export const StyledChip = styled.button.withConfig({
  displayName: 'Chip'
})<{ $selected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: var(${Design.Space.Xs});
  min-height: 40px;
  padding: var(${Design.Space.Xs}) var(${Design.Space.Md});
  border: 1px solid var(${Design.Color.Border});
  border-radius: var(${Design.Radius.Control});
  background: var(${Design.Color.Surface});
  color: var(${Design.Color.Accent});
  font: inherit;
  font-size: var(${Design.Font.SizeSm});
  white-space: nowrap;
  cursor: pointer;
  transition:
    border-color 120ms ease,
    background 120ms ease;

  &:hover:not(:disabled) {
    border-color: var(${Design.Color.Accent});
  }

  &:focus-visible {
    outline: 2px solid var(${Design.Color.Focus});
    outline-offset: 2px;
  }

  &:disabled {
    color: var(${Design.Color.TextMuted});
    cursor: not-allowed;
    opacity: 0.6;
  }

  ${({ $selected }) =>
    $selected &&
    css`
      border-color: var(${Design.Color.Accent});
      background: var(${Design.Color.Accent});
      color: var(${Design.Color.TextInverse});

      &:hover:not(:disabled) {
        filter: brightness(0.92);
      }
    `}
`;

export const ChipCount = styled.span.withConfig({
  displayName: 'ChipCount'
})`
  font-size: var(${Design.Font.SizeXs});
  opacity: 0.75;
`;
