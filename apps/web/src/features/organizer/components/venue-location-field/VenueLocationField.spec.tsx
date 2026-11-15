import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import type { PlaceResult } from '@/shared/api/geocoding';
import { VenueLocationField } from './VenueLocationField';

const TIDEL: PlaceResult = {
  id: '1',
  label: 'Tidel Park, Taramani, Chennai',
  location: { latitude: 12.9894, longitude: 80.2486 }
};

const setup = (
  props: Partial<Parameters<typeof VenueLocationField>[0]> = {}
) => {
  const onChange = vi.fn();
  const search = vi.fn().mockResolvedValue([TIDEL]);
  const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
  render(
    <form onSubmit={onSubmit}>
      <VenueLocationField
        value={null}
        onChange={onChange}
        suggestedQuery="Tidel Park, Chennai"
        search={search}
        {...props}
      />
    </form>
  );
  return { onChange, search, onSubmit };
};

describe('<VenueLocationField />', () => {
  it('searches for the venue and pins the chosen place', async () => {
    const user = userEvent.setup();
    const { onChange, search } = setup();

    await user.click(screen.getByRole('button', { name: 'Find' }));
    expect(search).toHaveBeenCalledWith(
      'Tidel Park, Chennai',
      expect.any(AbortSignal)
    );
    await user.click(await screen.findByRole('button', { name: TIDEL.label }));

    expect(onChange).toHaveBeenCalledWith(TIDEL.location);
    expect(
      screen.queryByRole('list', { name: 'Matching places' })
    ).not.toBeInTheDocument();
  });

  it('searches on Enter without submitting the event form', async () => {
    const user = userEvent.setup();
    const { search, onSubmit } = setup();
    const box = screen.getByLabelText('Search for the address');

    await user.clear(box);
    await user.type(box, 'Guindy{Enter}');

    expect(search).toHaveBeenCalledWith('Guindy', expect.any(AbortSignal));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('explains when nothing is found or the search is down', async () => {
    const user = userEvent.setup();
    const search = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error('offline'));
    setup({ search });
    const find = screen.getByRole('button', { name: 'Find' });

    await user.click(find);
    expect(await screen.findByText(/No places found/)).toBeInTheDocument();
    await user.click(find);
    expect(
      await screen.findByText(/Address search isn.t available/)
    ).toBeInTheDocument();
  });

  it('shows the pin, lets it be removed and shows errors', async () => {
    const user = userEvent.setup();
    const { onChange } = setup({
      value: TIDEL.location,
      error: 'Pin the venue on the map before publishing.'
    });

    expect(
      screen.getByText('Pinned at 12.98940, 80.24860')
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Pin the venue on the map before publishing.'
    );
    await user.click(screen.getByRole('button', { name: 'Remove pin' }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
