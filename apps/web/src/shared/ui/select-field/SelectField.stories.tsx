import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { SelectField, type SelectFieldProps } from './SelectField';

const Controlled = (args: SelectFieldProps) => {
  const [value, setValue] = useState(args.value);
  return (
    <div style={{ maxWidth: 420, minHeight: 300 }}>
      <SelectField
        {...args}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  );
};

const meta: Meta<typeof SelectField> = {
  title: 'Elements/SelectField',
  component: SelectField,
  args: {
    label: 'Time zone',
    value: 'Asia/Kolkata',
    onChange: () => undefined,
    options: [
      { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
      { value: 'Europe/London', label: 'Europe/London' },
      { value: 'America/New_York', label: 'America/New_York' }
    ]
  },
  render: (args) => <Controlled {...args} />
};

export default meta;

type Story = StoryObj<typeof SelectField>;

export const Default: Story = {};
export const WithError: Story = {
  args: { error: 'Choose a valid time zone.' }
};
