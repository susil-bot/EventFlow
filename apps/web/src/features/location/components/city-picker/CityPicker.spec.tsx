import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { cities, otherCity } from '@/shared/test/fixtures/cities';
import { renderWithProviders } from '@/shared/test/render';
import { CityPicker, type CityPickerProps } from './CityPicker';
import { LocateError } from './locate';

const renderPicker = (props: Partial<CityPickerProps> = {}) => {
  const onSelect = vi.fn();
  const onClose = vi.fn();
  renderWithProviders(
    <CityPicker
      open
      cities={cities}
      selectedCityId={null}
      onSelect={onSelect}
      onClose={onClose}
      locate={vi.fn()}
      {...props}
    />
  );
  return { onSelect, onClose };
};

describe('<CityPicker />', () => {
  it('shows popular cities with their upcoming event counts', async () => {
    const { onSelect } = renderPicker({ selectedCityId: 'chennai' });

    expect(
      screen.getByRole('dialog', { name: 'Choose your city' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'Search for your city' })
    ).toHaveFocus();
    const chennai = screen.getByRole('button', {
      name: /Chennai 3 upcoming events/
    });
    expect(chennai).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: /Pune No upcoming events/ })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Mumbai/ }));
    expect(onSelect).toHaveBeenCalledWith('mumbai');
  });

  it('finds cities by former names and picks with the keyboard', async () => {
    const { onSelect } = renderPicker();
    const search = screen.getByRole('combobox');

    await userEvent.type(search, 'bombay');
    expect(screen.getByRole('option', { name: /Mumbai/ })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await userEvent.clear(search);
    await userEvent.type(search, 'ch');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      expect.stringContaining('Chandigarh'),
      expect.stringContaining('Chennai'),
      // Matches its former name, Cochin, after the name matches.
      expect.stringContaining('Kochi')
    ]);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith('chennai');
  });

  it('says so when nothing matches', async () => {
    renderPicker();
    await userEvent.type(screen.getByRole('combobox'), 'zzz');
    expect(screen.getByText(/No city matches “zzz”/)).toBeInTheDocument();
  });

  it('detects the nearest city without sending the position anywhere', async () => {
    // A point in Gurugram snaps to Delhi-NCR.
    const locate = vi
      .fn()
      .mockResolvedValue({ latitude: 28.4595, longitude: 77.0266 });
    const { onSelect } = renderPicker({ locate });

    await userEvent.click(
      screen.getByRole('button', { name: 'Detect my location' })
    );
    expect(onSelect).toHaveBeenCalledWith('delhi-ncr');
  });

  it('explains when location is blocked or too far from any city', async () => {
    const locate = vi.fn().mockRejectedValueOnce(new LocateError('denied'));
    const { onSelect } = renderPicker({ locate });
    const detect = screen.getByRole('button', { name: 'Detect my location' });

    await userEvent.click(detect);
    expect(await screen.findByRole('status')).toHaveTextContent(
      /Location access is blocked/
    );

    // Leh is far from every supported city.
    locate.mockResolvedValueOnce({ latitude: 34.1526, longitude: 77.577 });
    await userEvent.click(detect);
    expect(
      await screen.findByText(/within 150 km of you yet/)
    ).toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('lists other cities behind View all and offers all cities', async () => {
    const { onSelect } = renderPicker({ cities: [...cities, otherCity] });

    expect(
      screen.queryByRole('button', { name: 'Mysuru' })
    ).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'View all cities' })
    );
    await userEvent.click(screen.getByRole('button', { name: 'Mysuru' }));
    expect(onSelect).toHaveBeenCalledWith('mysuru');

    await userEvent.click(
      screen.getByRole('button', { name: 'Show events in all cities' })
    );
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });

  it('hides View all when every city is popular', () => {
    renderPicker();
    expect(
      screen.queryByRole('button', { name: 'View all cities' })
    ).not.toBeInTheDocument();
  });
});
