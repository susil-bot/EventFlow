import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithProviders } from '@/shared/test/render';
import { LocationButton } from './LocationButton';

describe('<LocationButton />', () => {
  it('names the current city and opens the picker', async () => {
    const onClick = vi.fn();
    renderWithProviders(
      <LocationButton cityName="Chennai" onClick={onClick} />
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Change city (now: Chennai)' })
    );
    expect(onClick).toHaveBeenCalled();
  });

  it('falls back to all cities', () => {
    renderWithProviders(<LocationButton cityName={null} onClick={vi.fn()} />);
    expect(screen.getByText('All cities')).toBeInTheDocument();
  });
});
