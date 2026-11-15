import styled from 'styled-components';
import { BREAKPOINTS, Design } from '@/shared/styles/tokens';
import { overline } from '@/shared/styles/typography';

export const StyledLocationButton = styled.button.withConfig({
  displayName: 'LocationButton'
})`
  ${overline}
  display: inline-flex;
  align-items: center;
  gap: var(${Design.Space.Xs});
  min-height: 44px;
  min-width: 0;
  padding: var(${Design.Space.Xs}) var(${Design.Space.Sm});
  border: 1px solid var(${Design.Color.BorderStrong});
  border-radius: var(${Design.Radius.Control});
  background: var(${Design.Color.Surface});
  color: var(${Design.Color.Text});
  cursor: pointer;

  @media (min-width: ${BREAKPOINTS.sm}) {
    padding: var(${Design.Space.Xs}) var(${Design.Space.Md});
  }

  &:hover {
    background: var(${Design.Color.SurfaceMuted});
  }

  &:focus-visible {
    outline: 2px solid var(${Design.Color.Focus});
    outline-offset: 2px;
  }
`;
