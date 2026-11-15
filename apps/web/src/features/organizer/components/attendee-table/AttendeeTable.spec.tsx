import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { attendees } from '@/shared/test/fixtures/events';
import { AttendeeTable } from './AttendeeTable';

describe('<AttendeeTable />', () => {
  it('renders a row per attendee with name, email and time', () => {
    render(<AttendeeTable attendees={attendees} />);

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);
    expect(within(rows[0]!).getByText('Asha Attendee')).toBeInTheDocument();
    expect(
      within(rows[0]!).getByRole('link', { name: 'attendee@example.com' })
    ).toHaveAttribute('href', 'mailto:attendee@example.com');
  });
});
