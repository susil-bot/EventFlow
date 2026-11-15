import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { Select, type SelectProps } from './Select';

const OPTIONS = [
  { value: '', label: 'All categories' },
  { value: 'WORKSHOP', label: 'Workshops' },
  { value: 'MUSIC_SHOW', label: 'Music shows' },
  { value: 'COMEDY_SHOW', label: 'Comedy shows' }
];

/** Keeps the chosen value so the story is interactive. */
const Controlled = (args: SelectProps) => {
  const [value, setValue] = useState(args.value);
  return (
    <div style={{ maxWidth: 420, minHeight: 320 }}>
      <Select
        {...args}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  );
};

const meta: Meta<typeof Select> = {
  title: 'Elements/Select',
  component: Select,
  args: {
    options: OPTIONS,
    value: '',
    'aria-label': 'Category',
    onChange: () => undefined
  },
  render: (args) => <Controlled {...args} />
};

export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {};
export const WithError: Story = { args: { hasError: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Inline: Story = { args: { inline: true } };
