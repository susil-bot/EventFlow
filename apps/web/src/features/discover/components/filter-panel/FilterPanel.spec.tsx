import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithProviders } from '@/shared/test/render';
import {
  DEFAULT_FILTERS,
  type DiscoverFilters
} from '../../utils/discover-url';
import { FilterPanel } from './FilterPanel';

const renderPanel = (
  filters: Partial<DiscoverFilters> = {},
  cityName: string | null = 'Chennai'
) => {
  const onChange = vi.fn();
  const onChooseCity = vi.fn();
  renderWithProviders(
    <FilterPanel
      filters={{ ...DEFAULT_FILTERS, ...filters }}
      cityName={cityName}
      facets={{
        categories: [
          { category: 'WORKSHOP', count: 4 },
          { category: 'MUSIC_SHOW', count: 2 }
        ],
        total: 6
      }}
      onChange={onChange}
      onChooseCity={onChooseCity}
    />
  );
  return { onChange, onChooseCity };
};

describe('<FilterPanel />', () => {
  it('toggles categories with counts and disables empty ones', async () => {
    const { onChange } = renderPanel({ categories: ['WORKSHOP'] });

    expect(screen.getByRole('button', { name: 'Workshops 4' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Kids 0' })).toBeDisabled();

    await userEvent.click(
      screen.getByRole('button', { name: 'Music shows 2' })
    );
    expect(onChange).toHaveBeenLastCalledWith({
      categories: ['WORKSHOP', 'MUSIC_SHOW']
    });
    await userEvent.click(screen.getByRole('button', { name: 'Workshops 4' }));
    expect(onChange).toHaveBeenLastCalledWith({ categories: [] });
  });

  it('opens collapsed sections and applies single choices', async () => {
    const { onChange } = renderPanel();
    const toggle = screen.getByRole('button', { name: 'Price' });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    await userEvent.click(screen.getByRole('button', { name: 'Free' }));
    expect(onChange).toHaveBeenLastCalledWith({ price: 'free' });
  });

  it('clears one section or everything', async () => {
    const { onChange } = renderPanel({ date: 'today', formats: ['ONLINE'] });

    expect(screen.getByRole('button', { name: 'Clear price' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Clear date' }));
    expect(onChange).toHaveBeenLastCalledWith({ date: null });
    await userEvent.click(
      screen.getByRole('button', { name: 'Clear all (2)' })
    );
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ date: null, formats: [], categories: [] })
    );
  });

  it('offers distance only with a city', async () => {
    const { onChooseCity } = renderPanel({}, null);
    await userEvent.click(screen.getByRole('button', { name: 'Location' }));

    const section = screen.getByText(/Showing every city/).parentElement!;
    await userEvent.click(
      within(section).getByRole('button', { name: 'Choose a city' })
    );
    expect(onChooseCity).toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: /Within/ })
    ).not.toBeInTheDocument();
  });
});
