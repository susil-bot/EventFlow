import React from 'react';
import type { AvailabilityTone } from '../../utils/event-format';
import { MeterFill, MeterLabels, MeterTrack, StyledMeter } from './styles';

export type CapacityMeterProps = {
  registered: number;
  capacity: number;
};

const toneFor = (ratio: number): AvailabilityTone => {
  if (ratio >= 1) {
    return 'danger';
  }
  return ratio >= 0.8 ? 'warning' : 'success';
};

export const CapacityMeter = ({ registered, capacity }: CapacityMeterProps) => {
  const ratio = capacity > 0 ? Math.min(registered / capacity, 1) : 0;
  const remaining = Math.max(capacity - registered, 0);

  return (
    <StyledMeter>
      <MeterTrack
        role="meter"
        aria-label="Places taken"
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-valuenow={registered}
        aria-valuetext={`${registered} of ${capacity} places taken`}
      >
        <MeterFill $ratio={ratio} $tone={toneFor(ratio)} />
      </MeterTrack>
      <MeterLabels>
        <span>
          {registered} / {capacity} registered
        </span>
        <span>{remaining} remaining</span>
      </MeterLabels>
    </StyledMeter>
  );
};
