import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Route, Routes } from 'react-router';
import { renderWithProviders } from '@/shared/test/render';
import { BackLink } from './BackLink';

const renderAt = (history: string[]) =>
  renderWithProviders(
    <Routes>
      <Route
        path="/organizer/events/:id/attendees"
        element={<BackLink fallback="/organizer" />}
      />
      <Route path="/organizer" element={<h1>Dashboard</h1>} />
      <Route path="/organizer/events/:id/edit" element={<h1>Editor</h1>} />
    </Routes>,
    { route: '/organizer/events/e1/attendees', history }
  );

describe('<BackLink />', () => {
  it('returns to the page the user came from', async () => {
    renderAt(['/organizer/events/e1/edit']);
    await userEvent.click(screen.getByRole('link', { name: 'Back' }));
    expect(screen.getByRole('heading', { name: 'Editor' })).toBeInTheDocument();
  });

  it('goes to the fallback when the page was opened directly', async () => {
    renderAt([]);
    const link = screen.getByRole('link', { name: 'Back' });
    expect(link).toHaveAttribute('href', '/organizer');
    await userEvent.click(link);
    expect(
      screen.getByRole('heading', { name: 'Dashboard' })
    ).toBeInTheDocument();
  });
});
