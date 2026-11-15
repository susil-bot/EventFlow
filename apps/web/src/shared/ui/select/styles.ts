import styled, { css } from 'styled-components';
import { Design } from '@/shared/styles/tokens';

export const StyledSelect = styled.div.withConfig({
  displayName: 'Select'
})<{ $inline: boolean }>`
  position: relative;
  width: ${({ $inline }) => ($inline ? 'auto' : '100%')};
  min-width: ${({ $inline }) => ($inline ? '220px' : '0')};
`;

export const Trigger = styled.button.withConfig({
  displayName: 'SelectTrigger'
})<{ $hasError: boolean; $open: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(${Design.Space.Sm});
  width: 100%;
  min-height: 56px;
  padding: 12px 16px;
  border: 1px solid
    ${({ $hasError }) =>
      $hasError
        ? `var(${Design.Color.Danger})`
        : `var(${Design.Color.BorderStrong})`};
  border-radius: var(${Design.Radius.Control});
  background: var(${Design.Color.Surface});
  color: var(${Design.Color.Text});
  font: inherit;
  font-size: var(${Design.Font.SizeLg});
  text-align: left;
  cursor: pointer;

  &:focus {
    outline: none;
    box-shadow: inset 0 0 0 1px var(${Design.Color.BorderStrong});
  }

  &:focus-visible {
    outline: 3px solid var(${Design.Color.Focus});
    outline-offset: 2px;
  }

  &:disabled {
    background: var(${Design.Color.SurfaceMuted});
    color: var(${Design.Color.TextMuted});
    cursor: not-allowed;
  }
`;

export const TriggerText = styled.span.withConfig({
  displayName: 'SelectValue'
})`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Chevron = styled.span.withConfig({
  displayName: 'SelectChevron'
})<{ $open: boolean }>`
  display: inline-flex;
  flex: none;
  transition: transform 150ms ease;
  ${({ $open }) =>
    $open &&
    css`
      transform: rotate(180deg);
    `}
`;

export const OptionList = styled.ul.withConfig({
  displayName: 'SelectList'
})`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 40;
  max-height: 336px;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  border: 1px solid var(${Design.Color.OptionActive});
  border-top: 0;
  background: var(${Design.Color.Surface});
  list-style: none;

  &[hidden] {
    display: none;
  }
`;

export const Option = styled.li.withConfig({
  displayName: 'SelectOption'
})<{ $active: boolean }>`
  display: flex;
  align-items: center;
  min-height: 56px;
  padding: 12px 34px;
  border-top: 1px solid var(${Design.Color.OptionActive});
  background: ${({ $active }) =>
    $active ? `var(${Design.Color.OptionActive})` : 'transparent'};
  color: var(${Design.Color.Text});
  font-size: var(${Design.Font.SizeLg});
  cursor: pointer;

  &:first-child {
    border-top: 0;
  }
`;
