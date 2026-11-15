import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { SlotsField } from './SlotsField';

const slot = {
  label: 'Morning',
  startsAtLocal: '2030-09-03T10:00',
  endsAtLocal: '2030-09-03T12:00',
  capacity: '4'
};

describe('<SlotsField />', () => {
  it('adds an empty slot and shows the total capacity', async () => {
    const onChange = vi.fn();
    render(
      <SlotsField
        slots={[slot, { ...slot, capacity: '2' }]}
        onChange={onChange}
      />
    );

    expect(screen.getByText(/Total capacity: 6/)).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: /Add time slot/ })
    );

    expect(onChange.mock.calls[0]![0]).toHaveLength(3);
  });

  it('cannot be changed once locked', () => {
    render(<SlotsField slots={[slot]} onChange={vi.fn()} locked />);

    expect(screen.getByLabelText(/Slot name/)).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: /Add time slot/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Remove slot/ })
    ).not.toBeInTheDocument();
  });
});
