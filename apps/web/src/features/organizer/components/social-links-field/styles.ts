import styled from 'styled-components';
import { BREAKPOINTS, Design } from '@/shared/styles/tokens';

export const StyledSocialLinksField = styled.div.withConfig({
  displayName: 'SocialLinksField'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Sm});
`;

export const FieldTitle = styled.span.withConfig({
  displayName: 'SocialLinksFieldTitle'
})`
  font-size: var(${Design.Font.SizeSm});
  font-weight: 600;
`;

export const LinkRow = styled.div.withConfig({
  displayName: 'SocialLinksFieldRow'
})`
  display: grid;
  gap: var(${Design.Space.Xs});
  align-items: start;

  @media (min-width: ${BREAKPOINTS.sm}) {
    grid-template-columns: minmax(140px, 180px) 1fr auto;
  }
`;

export const RemoveCell = styled.div.withConfig({
  displayName: 'SocialLinksFieldRemove'
})`
  @media (min-width: ${BREAKPOINTS.sm}) {
    padding-top: 26px;
  }
`;

export const FieldError = styled.p.withConfig({
  displayName: 'SocialLinksFieldError'
})`
  font-size: var(${Design.Font.SizeSm});
  color: var(${Design.Color.Danger});
`;
