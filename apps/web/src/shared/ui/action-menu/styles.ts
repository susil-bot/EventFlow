import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';

export const StyledActionMenu = styled.div.withConfig({
  displayName: 'ActionMenu'
})`
  position: relative;
  display: inline-flex;
`;

export const Trigger = styled.button.withConfig({
  displayName: 'ActionMenuTrigger'
})`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  min-height: 48px;
  border: 0;
  border-radius: var(${Design.Radius.Control});
  background: transparent;
  color: var(${Design.Color.Accent});
  cursor: pointer;

  svg {
    stroke-width: 3;
  }

  &:hover,
  &[aria-expanded='true'] {
    background: var(${Design.Color.SurfaceMuted});
  }

  &:focus-visible {
    outline: 3px solid var(${Design.Color.Focus});
    outline-offset: 2px;
  }
`;

export const MenuList = styled.ul.withConfig({
  displayName: 'ActionMenuList'
})<{ $align: 'start' | 'end' }>`
  position: absolute;
  top: calc(100% + var(${Design.Space.Xs}));
  ${({ $align }) => ($align === 'end' ? 'right: 0;' : 'left: 0;')}
  z-index: 60;
  min-width: 220px;
  margin: 0;
  padding: var(${Design.Space.Xxs}) 0;
  border: 1px solid var(${Design.Color.Border});
  background: var(${Design.Color.Surface});
  box-shadow: var(${Design.Shadow.Raised});
  list-style: none;

  &[hidden] {
    display: none;
  }
`;

export const MenuItem = styled.button.withConfig({
  displayName: 'ActionMenuItem'
})<{ $danger: boolean }>`
  display: block;
  width: 100%;
  padding: var(${Design.Space.Sm}) var(${Design.Space.Md});
  border: 0;
  background: transparent;
  color: ${({ $danger }) =>
    $danger ? `var(${Design.Color.Danger})` : `var(${Design.Color.Text})`};
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:hover:not(:disabled),
  &:focus-visible {
    outline: none;
    background: var(${Design.Color.SurfaceMuted});
  }

  &:disabled {
    color: var(${Design.Color.TextMuted});
    cursor: not-allowed;
  }
`;
