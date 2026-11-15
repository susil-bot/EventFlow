import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { renderWithProviders } from '@/shared/test/render';
import { Select } from './Select';

const OPTIONS = [
  { value: '', label: 'All Subcategories' },
  { value: 'bathrooms', label: 'Bathrooms' },
  { value: 'kitchens', label: 'Kitchens' }
];

const Harness = ({ onChange }: { onChange: (value: string) => void }) => {
  const [value, setValue] = useState('');
  return (
    <>
      <label htmlFor="sub">Subcategories</label>
      <Select
        id="sub"
        options={OPTIONS}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          onChange(event.target.value);
        }}
      />
      <button type="button">Elsewhere</button>
    </>
  );
};

const trigger = () => screen.getByRole('combobox', { name: 'Subcategories' });

describe('<Select />', () => {
  it('opens a list, highlights the current option and picks with a click', async () => {
    const onChange = vi.fn();
    renderWithProviders(<Harness onChange={onChange} />);

    expect(trigger()).toHaveTextContent('All Subcategories');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await userEvent.click(trigger());

    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('option', { name: 'All Subcategories' })
    ).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(screen.getByRole('option', { name: 'Kitchens' }));

    expect(onChange).toHaveBeenCalledWith('kitchens');
    expect(trigger()).toHaveTextContent('Kitchens');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).toHaveFocus();
  });

  it('works from the keyboard', async () => {
    const onChange = vi.fn();
    renderWithProviders(<Harness onChange={onChange} />);
    trigger().focus();

    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('bathrooms');

    await userEvent.keyboard('{ArrowDown}{End}{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalledTimes(1);

    // Type to find, with the list closed.
    await userEvent.keyboard('k');
    expect(onChange).toHaveBeenLastCalledWith('kitchens');
  });

  it('closes when clicking elsewhere', async () => {
    renderWithProviders(<Harness onChange={vi.fn()} />);
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
