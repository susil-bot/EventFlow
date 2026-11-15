import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';

export const StyledSocialLinks = styled.ul.withConfig({
  displayName: 'SocialLinks'
})`
  display: flex;
  flex-wrap: wrap;
  gap: var(${Design.Space.Xs});
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const SocialAnchor = styled.a.withConfig({
  displayName: 'SocialLinksAnchor'
})`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(${Design.Color.Border});
  border-radius: var(${Design.Radius.Pill});
  color: var(${Design.Color.Text});
  background: var(${Design.Color.Surface});

  &:hover {
    color: var(${Design.Color.Accent});
    border-color: var(${Design.Color.Accent});
  }

  &:focus-visible {
    outline: 2px solid var(${Design.Color.Focus});
    outline-offset: 2px;
  }
`;
