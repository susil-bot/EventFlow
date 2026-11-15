import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithProviders } from '@/shared/test/render';
import { Chip } from './Chip';

describe('<Chip />', () => {
  it('is a toggle button with an optional count', async () => {
    const onClick = vi.fn();
    renderWithProviders(
      <Chip selected count={4} onClick={onClick}>
        Workshops
      </Chip>
    );

    const chip = screen.getByRole('button', { name: 'Workshops 4' });
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(chip);
    expect(onClick).toHaveBeenCalled();
  });
});
