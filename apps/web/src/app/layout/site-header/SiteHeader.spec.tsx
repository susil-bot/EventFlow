import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { organizerUser } from '@/shared/test/fixtures/events';
import { renderWithProviders } from '@/shared/test/render';
import { SiteHeader, type SiteHeaderProps } from './SiteHeader';

const renderHeader = (props: Partial<SiteHeaderProps> = {}, route = '/') => {
  const handlers = {
    onSearch: vi.fn(),
    onChooseCity: vi.fn(),
    onLogout: vi.fn()
  };
  renderWithProviders(
    <SiteHeader
      user={null}
      cityName="Chennai"
      discoverTo="/discover/events-chennai"
      query=""
      {...handlers}
      {...props}
    />,
    { route }
  );
  return handlers;
};

describe('<SiteHeader />', () => {
  it('offers sign in, the city and organizer sign-up to visitors', async () => {
    const { onChooseCity, onSearch } = renderHeader(
      {},
      '/discover/events-chennai'
    );

    // jsdom ignores media queries, so desktop-only parts count as hidden
    // to role queries; these checks go by text instead.
    const linkTo = (text: string) => screen.getAllByText(text)[0]!.closest('a');
    expect(linkTo('Events')).toHaveAttribute('aria-current', 'page');
    expect(linkTo('List your event')).toHaveAttribute(
      'href',
      '/signup?role=ORGANIZER'
    );
    expect(linkTo('Sign in')).toHaveAttribute('href', '/login');

    await userEvent.click(
      screen.getByRole('button', { name: 'Change city (now: Chennai)' })
    );
    expect(onChooseCity).toHaveBeenCalled();
    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Search events' }),
      '  react  {Enter}'
    );
    expect(onSearch).toHaveBeenCalledWith('react');
  });

  it('shows role links and an account menu with log out', async () => {
    const { onLogout } = renderHeader({ user: organizerUser });

    expect(
      screen.getAllByText('Create event')[0]!.closest('a')
    ).toHaveAttribute('href', '/organizer/events/new');
    const account = screen.getByLabelText('Account: Olivia Organizer');
    const email = screen.getByText('organizer@example.com');
    expect(account).toHaveAttribute('aria-expanded', 'false');
    expect(email.closest('[hidden]')).not.toBeNull();
    await userEvent.click(account);
    expect(account).toHaveAttribute('aria-expanded', 'true');
    expect(email.closest('[hidden]')).toBeNull();
    await userEvent.click(screen.getAllByText('Log out')[0]!);
    expect(onLogout).toHaveBeenCalled();
  });

  it('folds the links into a menu on small screens', async () => {
    renderHeader();
    const menuButton = screen.getByRole('button', { name: 'Menu' });

    await userEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('navigation', { name: 'Menu' })).toBeVisible();
  });
});
