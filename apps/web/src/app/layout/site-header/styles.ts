import { Link } from 'react-router';
import styled, { css } from 'styled-components';
import { BREAKPOINTS, Design } from '@/shared/styles/tokens';
import { displayHeading } from '@/shared/styles/typography';

const container = css`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(${Design.Space.Md});

  @media (min-width: ${BREAKPOINTS.md}) {
    padding: 0 var(${Design.Space.Xl});
  }
`;

const plainButton = css`
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
`;

export const StyledHeader = styled.header.withConfig({
  displayName: 'SiteHeader'
})`
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(${Design.Color.Surface});
  border-bottom: 1px solid var(${Design.Color.Border});
`;

export const TopBar = styled.div.withConfig({ displayName: 'SiteHeaderTop' })`
  padding: var(${Design.Space.Sm}) 0;
`;

export const HeaderInner = styled.div.withConfig({
  displayName: 'SiteHeaderInner'
})`
  ${container}
  display: grid;
  /* minmax(0, …) lets the actions shrink instead of widening the page. */
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas:
    'brand actions'
    'search search';
  align-items: center;
  gap: var(${Design.Space.Sm});

  @media (min-width: ${BREAKPOINTS.sm}) {
    column-gap: var(${Design.Space.Lg});
  }

  @media (min-width: ${BREAKPOINTS.md}) {
    grid-template-columns: auto minmax(0, 560px) 1fr;
    grid-template-areas: 'brand search actions';
  }
`;

export const Brand = styled(Link).withConfig({ displayName: 'SiteBrand' })`
  ${displayHeading}
  grid-area: brand;
  color: var(${Design.Color.Text});
  font-size: var(${Design.Font.SizeXl});
  white-space: nowrap;
  text-decoration: none;

  @media (min-width: ${BREAKPOINTS.sm}) {
    font-size: var(${Design.Font.SizeXxl});
  }
`;

export const HeaderSearch = styled.form.withConfig({
  displayName: 'SiteHeaderSearch'
})`
  grid-area: search;
  display: flex;
  align-items: center;
  gap: var(${Design.Space.Sm});
  min-height: 44px;
  padding: 0 var(${Design.Space.Md});
  border: 1px solid var(${Design.Color.Border});
  border-radius: var(${Design.Radius.Control});
  color: var(${Design.Color.TextMuted});

  &:focus-within {
    border-color: var(${Design.Color.BorderStrong});
  }
`;

export const SearchInput = styled.input.withConfig({
  displayName: 'SiteHeaderSearchInput'
})`
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(${Design.Color.Text});
  font: inherit;
`;

export const TopBarActions = styled.div.withConfig({
  displayName: 'SiteHeaderActions'
})`
  grid-area: actions;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(${Design.Space.Sm});

  /* Sign in and the account menu move into the menu on phones. */
  > a,
  > div {
    display: none;

    @media (min-width: ${BREAKPOINTS.sm}) {
      display: inline-flex;
    }
  }
`;

export const MenuButton = styled.button.withConfig({
  displayName: 'SiteMenuButton'
})`
  ${plainButton}
  display: inline-flex;
  padding: var(${Design.Space.Xs});

  @media (min-width: ${BREAKPOINTS.md}) {
    display: none;
  }
`;

export const NavBar = styled.nav.withConfig({ displayName: 'SiteNav' })`
  display: none;
  background: var(${Design.Color.SurfaceMuted});
  border-top: 1px solid var(${Design.Color.Border});

  @media (min-width: ${BREAKPOINTS.md}) {
    display: block;
  }
`;

export const NavInner = styled.div.withConfig({
  displayName: 'SiteNavInner'
})`
  ${container}
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(${Design.Space.Lg});
`;

export const NavList = styled.ul.withConfig({ displayName: 'SiteNavList' })`
  display: flex;
  flex-wrap: wrap;
  gap: var(${Design.Space.Xs}) var(${Design.Space.Xl});
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const NavLinkItem = styled(Link).withConfig({
  displayName: 'SiteNavLink'
})`
  display: inline-block;
  padding: var(${Design.Space.Sm}) 0;
  border-bottom: 2px solid transparent;
  color: var(${Design.Color.Text});
  text-decoration: none;

  &:hover {
    border-bottom-color: var(${Design.Color.Border});
  }

  &[aria-current='page'] {
    border-bottom-color: var(${Design.Color.Primary});
    font-weight: 500;
  }
`;

export const SecondaryLink = styled(Link).withConfig({
  displayName: 'SiteSecondaryLink'
})`
  color: var(${Design.Color.Accent});
  font-size: var(${Design.Font.SizeSm});
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const MobileMenu = styled.nav.withConfig({
  displayName: 'SiteMobileMenu'
})`
  ${container}
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Md});
  padding-top: var(${Design.Space.Sm});
  padding-bottom: var(${Design.Space.Lg});
  border-top: 1px solid var(${Design.Color.Border});

  ${NavList} {
    flex-direction: column;
  }

  &[hidden] {
    display: none;
  }

  @media (min-width: ${BREAKPOINTS.md}) {
    display: none;
  }
`;

export const MobileMenuAccount = styled.div.withConfig({
  displayName: 'SiteMobileAccount'
})`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(${Design.Space.Sm});
  padding-top: var(${Design.Space.Md});
  border-top: 1px solid var(${Design.Color.Border});
  font-size: var(${Design.Font.SizeSm});

  button {
    ${plainButton}
    color: var(${Design.Color.Accent});
  }
`;

export const StyledAccountMenu = styled.div.withConfig({
  displayName: 'AccountMenu'
})`
  position: relative;
`;

/**
 * Person icon + underlined uppercase label in a pill that tints on hover:
 * "Sign in" when signed out, the first name (opening the account menu) when
 * signed in.
 */
const profileControl = css`
  display: inline-flex;
  align-items: center;
  gap: var(${Design.Space.Sm});
  min-height: 44px;
  padding: var(${Design.Space.Xs}) var(${Design.Space.Md});
  border-radius: var(${Design.Radius.Pill});
  color: var(${Design.Color.Text});
  font-size: var(${Design.Font.SizeSm});
  font-weight: 500;
  letter-spacing: var(${Design.Font.TrackingWide});
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;

  svg {
    flex: none;
    stroke-width: 2;
  }

  span {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 4px;
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

export const ProfileLink = styled(Link).withConfig({
  displayName: 'SiteHeaderProfileLink'
})`
  ${profileControl}
`;

export const AccountButton = styled.button.withConfig({
  displayName: 'AccountMenuButton'
})`
  ${plainButton}
  ${profileControl}
`;

export const AccountPopover = styled.div.withConfig({
  displayName: 'AccountMenuPopover'
})`
  position: absolute;
  top: calc(100% + var(${Design.Space.Xs}));
  right: 0;
  z-index: 60;
  min-width: 240px;
  border: 1px solid var(${Design.Color.Border});
  background: var(${Design.Color.Surface});
  box-shadow: var(${Design.Shadow.Raised});

  &[hidden] {
    display: none;
  }
`;

export const AccountDetails = styled.div.withConfig({
  displayName: 'AccountMenuDetails'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Xxs});
  padding: var(${Design.Space.Md});
  border-bottom: 1px solid var(${Design.Color.Border});

  span {
    color: var(${Design.Color.TextMuted});
    font-size: var(${Design.Font.SizeSm});
  }
`;

export const LogoutButton = styled.button.withConfig({
  displayName: 'AccountMenuLogout'
})`
  ${plainButton}
  display: flex;
  align-items: center;
  gap: var(${Design.Space.Xs});
  width: 100%;
  padding: var(${Design.Space.Sm}) var(${Design.Space.Md});
  text-align: left;

  &:hover {
    background: var(${Design.Color.SurfaceMuted});
  }
`;
