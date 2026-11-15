import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Route, Routes } from 'react-router';
import { ApiError } from '@/shared/api/client';
import type * as endpoints from '@/shared/api/endpoints';
import { authApi } from '@/shared/api/endpoints';
import { organizerUser } from '@/shared/test/fixtures/events';
import { renderWithProviders } from '@/shared/test/render';
import { LoginPage } from './LoginPage';

vi.mock('@/shared/api/endpoints', async (importOriginal) => {
  const actual = await importOriginal<typeof endpoints>();
  return {
    ...actual,
    authApi: { ...actual.authApi, session: vi.fn(), login: vi.fn() }
  };
});

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<h1>Signed in</h1>} />
    </Routes>,
    { route: '/login', withAuth: true }
  );

const signIn = async (password = 'Password123!') => {
  await userEvent.type(
    await screen.findByLabelText(/Email/),
    'organizer@example.com'
  );
  await userEvent.type(screen.getByLabelText(/Password/), password);
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
};

beforeEach(() => {
  vi.mocked(authApi.session).mockResolvedValue(null);
});

describe('<LoginPage />', () => {
  it('explains an outage, shows the reference and retries', async () => {
    vi.mocked(authApi.login)
      .mockRejectedValueOnce(
        new ApiError(
          503,
          'SERVICE_UNAVAILABLE',
          'EventFlow is temporarily unavailable. Please try again in a moment.',
          {},
          'ecfc957b-1111-2222'
        )
      )
      .mockResolvedValueOnce(organizerUser);
    renderPage();
    await signIn();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent("We couldn't sign you in");
    expect(alert).toHaveTextContent('temporarily unavailable');
    expect(alert).toHaveTextContent('Reference: ecfc957b');

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Signed in')).toBeInTheDocument();
    expect(authApi.login).toHaveBeenLastCalledWith({
      email: 'organizer@example.com',
      password: 'Password123!'
    });
  });

  it('says when the details are wrong, without a reference or retry', async () => {
    vi.mocked(authApi.login).mockRejectedValue(
      new ApiError(
        401,
        'INVALID_CREDENTIALS',
        'Email or password is incorrect.',
        {},
        'abcd1234-0000'
      )
    );
    renderPage();
    await signIn('wrong-password');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Email or password is incorrect.');
    expect(alert).not.toHaveTextContent('Reference');
    expect(
      screen.queryByRole('button', { name: 'Try again' })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Password/)).toHaveValue('');
  });
});
