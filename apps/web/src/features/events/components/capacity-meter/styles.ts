import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';
import type { AvailabilityTone } from '../../utils/event-format';

const FILL: Record<AvailabilityTone, string> = {
  success: Design.Color.Success,
  warning: Design.Color.Warning,
  danger: Design.Color.Danger,
  neutral: Design.Color.TextMuted
};

export const StyledMeter = styled.div.withConfig({
  displayName: 'CapacityMeter'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Xxs});
`;

export const MeterTrack = styled.div.withConfig({
  displayName: 'CapacityMeterTrack'
})`
  height: 6px;
  overflow: hidden;
  border-radius: var(${Design.Radius.Pill});
  background: var(${Design.Color.Border});
`;

export const MeterFill = styled.div.withConfig({
  displayName: 'CapacityMeterFill'
})<{ $ratio: number; $tone: AvailabilityTone }>`
  height: 100%;
  width: ${({ $ratio }) => `${$ratio * 100}%`};
  border-radius: inherit;
  background: var(${({ $tone }) => FILL[$tone]});
  transition: width 300ms ease;
`;

export const MeterLabels = styled.div.withConfig({
  displayName: 'CapacityMeterLabels'
})`
  display: flex;
  justify-content: space-between;
  font-size: var(${Design.Font.SizeXs});
  color: var(${Design.Color.TextMuted});
`;
