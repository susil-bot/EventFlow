import { render, screen } from '@testing-library/react';
import React from 'react';
import { CapacityMeter } from './CapacityMeter';

describe('<CapacityMeter />', () => {
  it('describes taken and remaining places', () => {
    render(<CapacityMeter registered={3} capacity={10} />);

    expect(screen.getByRole('meter')).toHaveAttribute(
      'aria-valuetext',
      '3 of 10 places taken'
    );
    expect(screen.getByText('7 remaining')).toBeInTheDocument();
  });
});
