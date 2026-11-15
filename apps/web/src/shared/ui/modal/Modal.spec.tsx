import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { renderWithProviders } from '@/shared/test/render';
import { Modal } from './Modal';

const Harness = ({ onClose = vi.fn() }: { onClose?: () => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Modal
        open={open}
        title="Choose a city"
        onClose={() => {
          onClose();
          setOpen(false);
        }}
      >
        <input aria-label="Search" />
        <button type="button">Pick</button>
      </Modal>
    </>
  );
};

describe('<Modal />', () => {
  it('is a labelled dialog that focuses inside, traps Tab and restores focus', async () => {
    renderWithProviders(<Harness />);
    const opener = screen.getByRole('button', { name: 'Open' });

    await userEvent.click(opener);
    expect(
      screen.getByRole('dialog', { name: 'Choose a city' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();

    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Pick' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});
