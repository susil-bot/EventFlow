import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithProviders } from '@/shared/test/render';
import { ReasonAction } from './ReasonAction';

describe('<ReasonAction />', () => {
  it('asks for a reason before confirming', async () => {
    const onConfirm = vi.fn();
    renderWithProviders(
      <ReasonAction
        label="Suspend"
        confirmLabel="Suspend account"
        onConfirm={onConfirm}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Suspend' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Suspend account' })
    );
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByText(/at least 3 characters/)).toBeInTheDocument();

    await userEvent.type(
      screen.getByRole('textbox', { name: /Reason/ }),
      '  Spam  '
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Suspend account' })
    );
    expect(onConfirm).toHaveBeenCalledWith('Spam');
  });

  it('can be backed out of', async () => {
    renderWithProviders(
      <ReasonAction
        label="Cancel"
        confirmLabel="Cancel event"
        onConfirm={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await userEvent.click(screen.getByRole('button', { name: 'Keep' }));

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
