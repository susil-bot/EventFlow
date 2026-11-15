import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router';
import { renderWithProviders } from '@/shared/test/render';
import { useLeaveGuard } from './use-leave-guard';

const Editor = ({ dirty }: { dirty: boolean }) => {
  const { blocker, allowNavigation } = useLeaveGuard(dirty);
  const navigate = useNavigate();
  return (
    <>
      <h1>Editor</h1>
      <Link to="/elsewhere">Elsewhere</Link>
      <Link to="?tab=2">Same page</Link>
      <button
        type="button"
        onClick={() => {
          allowNavigation();
          navigate('/elsewhere');
        }}
      >
        Save and go
      </button>
      {blocker.state === 'blocked' ? (
        <div role="dialog" aria-label="Leave?">
          <button type="button" onClick={() => blocker.proceed()}>
            Leave
          </button>
          <button type="button" onClick={() => blocker.reset()}>
            Stay
          </button>
        </div>
      ) : null}
    </>
  );
};

const setup = (dirty: boolean, history: string[] = []) =>
  renderWithProviders(
    <Routes>
      <Route path="/edit" element={<Editor dirty={dirty} />} />
      <Route path="/elsewhere" element={<h1>Elsewhere page</h1>} />
    </Routes>,
    { route: '/edit', history }
  );

describe('useLeaveGuard', () => {
  it('lets navigation through when nothing is unsaved', async () => {
    setup(false);
    await userEvent.click(screen.getByRole('link', { name: 'Elsewhere' }));
    expect(screen.getByText('Elsewhere page')).toBeInTheDocument();
  });

  it('holds navigation with unsaved work until the user decides', async () => {
    setup(true);
    await userEvent.click(screen.getByRole('link', { name: 'Elsewhere' }));
    expect(screen.getByRole('dialog', { name: 'Leave?' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Stay' }));
    expect(screen.getByRole('heading', { name: 'Editor' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('link', { name: 'Elsewhere' }));
    await userEvent.click(screen.getByRole('button', { name: 'Leave' }));
    expect(screen.getByText('Elsewhere page')).toBeInTheDocument();
  });

  it('holds the browser Back button too', async () => {
    const { router } = setup(true, ['/elsewhere']);
    await act(() => router.navigate(-1));
    expect(screen.getByRole('dialog', { name: 'Leave?' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Editor' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Leave' }));
    expect(screen.getByText('Elsewhere page')).toBeInTheDocument();
  });

  it('ignores changes that stay on the same page', async () => {
    setup(true);
    await userEvent.click(screen.getByRole('link', { name: 'Same page' }));
    expect(
      screen.queryByRole('dialog', { name: 'Leave?' })
    ).not.toBeInTheDocument();
  });

  it('lets an intended navigation through (after saving)', async () => {
    setup(true);
    await userEvent.click(screen.getByRole('button', { name: 'Save and go' }));
    expect(screen.getByText('Elsewhere page')).toBeInTheDocument();
  });

  it('asks the browser to confirm closing the tab', () => {
    setup(true);
    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});
