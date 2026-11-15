import React from 'react';
import type { EventDto } from '@/shared/api/types';
import {
  describePhase,
  PHASE_LABEL,
  PHASE_TONE
} from '../../utils/event-phase';
import { ChipDetail, ChipLabel, StyledPhaseChip } from './styles';

export type PhaseChipProps = {
  event: Pick<EventDto, 'phase' | 'publishAt' | 'expiresAt' | 'timeZone'>;
  /** `overlay` sits on top of a cover image; `inline` sits in a table. */
  variant?: 'overlay' | 'inline';
};

/**
 * Status for the people who manage the event (its organizer and admins):
 * Draft, Scheduled, Live, Expired, Ended or Canceled, with the go-live or
 * listing-end time when there is one. Attendees never see it.
 */
export const PhaseChip = ({ event, variant = 'inline' }: PhaseChipProps) => {
  const detail = describePhase(event);
  return (
    <StyledPhaseChip $tone={PHASE_TONE[event.phase]} $variant={variant}>
      <ChipLabel>{PHASE_LABEL[event.phase]}</ChipLabel>
      {detail ? <ChipDetail>{detail}</ChipDetail> : null}
    </StyledPhaseChip>
  );
};
