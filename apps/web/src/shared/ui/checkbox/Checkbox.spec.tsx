import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithProviders } from '@/shared/test/render';
import { Checkbox } from './Checkbox';

describe('<Checkbox />', () => {
  it('is labelled and toggles', async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <Checkbox label="Include online events" onChange={onChange} />
    );

    const box = screen.getByRole('checkbox', { name: 'Include online events' });
    await userEvent.click(box);
    expect(box).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
