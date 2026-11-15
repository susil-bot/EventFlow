import { screen } from '@testing-library/react';
import React from 'react';
import { draftEvent, scheduledEvent } from '@/shared/test/fixtures/events';
import { renderWithProviders } from '@/shared/test/render';
import { PhaseChip } from './PhaseChip';

describe('<PhaseChip />', () => {
  it('shows the phase and when a scheduled event goes live', () => {
    renderWithProviders(<PhaseChip event={scheduledEvent} />);
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
    expect(
      screen.getByText('Goes live Sun, 1 Sept, 10:00')
    ).toBeInTheDocument();
  });

  it('shows just the phase when there is no time to add', () => {
    renderWithProviders(<PhaseChip event={draftEvent} />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });
});
