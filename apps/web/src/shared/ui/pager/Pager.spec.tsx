import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithProviders } from '@/shared/test/render';
import { Pager } from './Pager';

describe('<Pager />', () => {
  it('moves between pages and stops at the ends', async () => {
    const onOffsetChange = vi.fn();
    renderWithProviders(
      <Pager
        total={30}
        offset={12}
        pageSize={12}
        onOffsetChange={onOffsetChange}
      />
    );

    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onOffsetChange).toHaveBeenCalledWith(24);
    await userEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(onOffsetChange).toHaveBeenLastCalledWith(0);
  });

  it('renders nothing for a single page', () => {
    renderWithProviders(
      <Pager total={5} offset={0} pageSize={12} onOffsetChange={vi.fn()} />
    );

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
