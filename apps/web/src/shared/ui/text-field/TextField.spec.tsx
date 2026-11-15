import { render, screen } from '@testing-library/react';
import React from 'react';
import { TextField } from './TextField';

describe('<TextField />', () => {
  it('associates the label, hint and error with the control', () => {
    render(
      <TextField
        label="Capacity"
        hint="Maximum attendees"
        error="Capacity must be at least 1."
        defaultValue="0"
      />
    );
    const input = screen.getByLabelText('Capacity');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(
      'Maximum attendees Capacity must be at least 1.'
    );
  });

  it('renders a textarea when multiline', () => {
    render(<TextField label="Description" multiline />);

    expect(screen.getByLabelText('Description').tagName).toBe('TEXTAREA');
  });

  it('counts characters against the limit when asked', () => {
    render(
      <TextField
        label="Title"
        value="React Chennai"
        onChange={() => undefined}
        maxLength={150}
        showCount
      />
    );
    expect(screen.getByText('13 / 150 chars')).toBeInTheDocument();
  });
});
