import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithProviders } from '@/shared/test/render';
import { CategoryChips } from './CategoryChips';

describe('<CategoryChips />', () => {
  it('shows categories that have events, plus selected ones', async () => {
    const onToggle = vi.fn();
    renderWithProviders(
      <CategoryChips
        selected={['KIDS']}
        facets={{
          categories: [
            { category: 'WORKSHOP', count: 3 },
            { category: 'MEETUP', count: 0 }
          ],
          total: 3
        }}
        onToggle={onToggle}
      />
    );

    expect(
      screen.getAllByRole('button').map((chip) => chip.textContent)
    ).toEqual(['Workshops', 'Kids']);
    await userEvent.click(screen.getByRole('button', { name: 'Workshops' }));
    expect(onToggle).toHaveBeenCalledWith('WORKSHOP');
  });
});
