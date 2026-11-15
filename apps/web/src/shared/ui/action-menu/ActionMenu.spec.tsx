import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithProviders } from '@/shared/test/render';
import { ActionMenu } from './ActionMenu';

describe('<ActionMenu />', () => {
  it('opens a menu, moves with the arrows and runs the chosen action', async () => {
    const unpublish = vi.fn();
    const cancel = vi.fn();
    renderWithProviders(
      <ActionMenu
        label="More actions"
        items={[
          { label: 'Unpublish', onSelect: unpublish },
          { label: 'Cancel event', onSelect: cancel, tone: 'danger' }
        ]}
      />
    );
    const trigger = screen.getByRole('button', { name: 'More actions' });

    await userEvent.click(trigger);
    expect(screen.getByRole('menuitem', { name: 'Unpublish' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{Enter}');

    expect(cancel).toHaveBeenCalled();
    expect(unpublish).not.toHaveBeenCalled();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('closes with Escape and renders nothing without items', async () => {
    const { rerender } = renderWithProviders(
      <ActionMenu
        label="More actions"
        items={[{ label: 'Unpublish', onSelect: vi.fn() }]}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'More actions' }));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    rerender(<ActionMenu label="More actions" items={[]} />);
    expect(
      screen.queryByRole('button', { name: 'More actions' })
    ).not.toBeInTheDocument();
  });
});
