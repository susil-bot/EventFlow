import { screen } from '@testing-library/react';
import React from 'react';
import { chooseOption } from '@/shared/test/select';
import { renderWithProviders } from '@/shared/test/render';
import { describeRange, ResultsBar } from './ResultsBar';

describe('describeRange', () => {
  it.each([
    [0, 0, 0, 'No results'],
    [1, 0, 1, '1 - 1 of 1 result'],
    [30, 12, 12, '13 - 24 of 30 results']
  ])('total %i from %i (%i shown) → %s', (total, offset, count, text) => {
    expect(describeRange(total, offset, count)).toBe(text);
  });
});

describe('<ResultsBar />', () => {
  it('changes the sort order', async () => {
    const onSortChange = vi.fn();
    renderWithProviders(
      <ResultsBar
        total={30}
        offset={0}
        count={12}
        sort="soonest"
        onSortChange={onSortChange}
      />
    );

    expect(screen.getByText('1 - 12 of 30 results')).toBeInTheDocument();
    await chooseOption(
      screen.getByRole('combobox', { name: 'Sort by:' }),
      'Most places left'
    );
    expect(onSortChange).toHaveBeenCalledWith('most-available');
  });
});
