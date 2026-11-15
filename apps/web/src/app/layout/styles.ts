import styled from 'styled-components';
import { BREAKPOINTS, Design } from '@/shared/styles/tokens';
import { displayHeading } from '@/shared/styles/typography';

export const StyledLayout = styled.div.withConfig({
  displayName: 'SiteLayout'
})`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const Main = styled.main.withConfig({ displayName: 'SiteMain' })`
  flex: 1;
  padding: var(${Design.Space.Lg}) var(${Design.Space.Md})
    var(${Design.Space.Xxl});

  @media (min-width: ${BREAKPOINTS.md}) {
    padding: var(${Design.Space.Xxl}) var(${Design.Space.Xl});
  }
`;

export const MainInner = styled.div.withConfig({
  displayName: 'SiteMainInner'
})`
  max-width: 1280px;
  margin: 0 auto;
`;

export const Footer = styled.footer.withConfig({ displayName: 'SiteFooter' })`
  border-top: 1px solid var(${Design.Color.Border});
  background: var(${Design.Color.Surface});
  color: var(${Design.Color.TextMuted});
  font-size: var(${Design.Font.SizeSm});
`;

export const FooterInner = styled.div.withConfig({
  displayName: 'SiteFooterInner'
})`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(${Design.Space.Sm});
  max-width: 1280px;
  margin: 0 auto;
  padding: var(${Design.Space.Lg}) var(${Design.Space.Md});

  @media (min-width: ${BREAKPOINTS.md}) {
    padding: var(${Design.Space.Lg}) var(${Design.Space.Xl});
  }

  span:first-child {
    ${displayHeading}
    color: var(${Design.Color.Text});
    font-size: var(${Design.Font.SizeLg});
  }
`;
