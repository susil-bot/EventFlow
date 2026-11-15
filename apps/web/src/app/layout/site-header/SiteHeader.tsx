import React, { type FormEvent, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import type { User } from '@/shared/api/types';
import { LinkButton } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { LocationButton } from '@/features/location/components/location-button';
import { AccountMenu, describeAccount } from './AccountMenu';
import { getNavItems, isNavItemActive } from './nav-items';
import {
  Brand,
  HeaderInner,
  HeaderSearch,
  MenuButton,
  MobileMenu,
  MobileMenuAccount,
  NavBar,
  NavInner,
  NavLinkItem,
  NavList,
  ProfileLink,
  SearchInput,
  SecondaryLink,
  StyledHeader,
  TopBar,
  TopBarActions
} from './styles';

export type SiteHeaderProps = {
  user: User | null;
  /** Current city name, or null for all cities. */
  cityName: string | null;
  /** Discover for the current city. */
  discoverTo: string;
  /** Current keyword, to prefill the search box on Discover. */
  query: string;
  onSearch: (query: string) => void;
  onChooseCity: () => void;
  onLogout: () => void;
};

/**
 * Two-row site header. Row one: brand, search, city and account. Row two:
 * the links for the signed-in role. On small screens row two folds into a
 * menu.
 */
export const SiteHeader = ({
  user,
  cityName,
  discoverTo,
  query,
  onSearch,
  onChooseCity,
  onLogout
}: SiteHeaderProps) => {
  const { pathname } = useLocation();
  // The mobile menu stays open only on the page it was opened on, so
  // following a link closes it.
  const [menuOpenedOn, setMenuOpenedOn] = useState<string | null>(null);
  const menuOpen = menuOpenedOn === pathname;
  const items = getNavItems(user, discoverTo);
  const headerRef = useRef<HTMLElement>(null);

  // Publish the header's height as a CSS variable, so things that stick
  // below it (the event editor's action bar) know where to stop.
  useEffect(() => {
    const header = headerRef.current;
    if (!header || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const root = document.documentElement;
    const observer = new ResizeObserver(() =>
      root.style.setProperty(
        '--site-header-height',
        `${header.getBoundingClientRect().height}px`
      )
    );
    observer.observe(header);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--site-header-height');
    };
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSearch(String(data.get('q') ?? '').trim());
  };

  const links = items.map((item) => (
    <li key={item.label}>
      <NavLinkItem
        to={item.to}
        aria-current={isNavItemActive(item, pathname) ? 'page' : undefined}
      >
        {item.label}
      </NavLinkItem>
    </li>
  ));

  return (
    <StyledHeader ref={headerRef}>
      <TopBar>
        <HeaderInner>
          <Brand to={discoverTo}>EventFlow</Brand>
          <HeaderSearch role="search" onSubmit={handleSearch}>
            <Icon name="search" size={20} />
            <SearchInput
              key={query}
              name="q"
              type="search"
              aria-label="Search events"
              placeholder="Search events, venues and hosts"
              defaultValue={query}
              maxLength={100}
            />
          </HeaderSearch>
          <TopBarActions>
            <LocationButton cityName={cityName} onClick={onChooseCity} />
            {user ? (
              <AccountMenu user={user} onLogout={onLogout} />
            ) : (
              <ProfileLink to="/login">
                <Icon name="user" size={24} />
                <span>Sign in</span>
              </ProfileLink>
            )}
            <MenuButton
              type="button"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label="Menu"
              onClick={() => setMenuOpenedOn(menuOpen ? null : pathname)}
            >
              <Icon name={menuOpen ? 'close' : 'menu'} size={24} />
            </MenuButton>
          </TopBarActions>
        </HeaderInner>
      </TopBar>

      <NavBar aria-label="Main">
        <NavInner>
          <NavList>{links}</NavList>
          {user ? null : (
            <SecondaryLink to="/signup?role=ORGANIZER">
              List your event
            </SecondaryLink>
          )}
        </NavInner>
      </NavBar>

      <MobileMenu id="site-menu" hidden={!menuOpen} aria-label="Menu">
        <NavList>{links}</NavList>
        <MobileMenuAccount>
          {user ? (
            <>
              <p>
                <strong>{user.name}</strong> · {describeAccount(user)}
              </p>
              <button type="button" onClick={onLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <LinkButton to="/login" size="sm">
                Sign in
              </LinkButton>
              <SecondaryLink to="/signup?role=ORGANIZER">
                List your event
              </SecondaryLink>
            </>
          )}
        </MobileMenuAccount>
      </MobileMenu>
    </StyledHeader>
  );
};
