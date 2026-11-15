import React from 'react';
import { Icon, type IconName } from '../icon';
import { StatIcon, StatLabel, StatValue, StyledStatCard } from './styles';

export type StatCardProps = {
  label: string;
  value: number | string;
  icon: IconName;
};

export const StatCard = ({ label, value, icon }: StatCardProps) => (
  <StyledStatCard>
    <StatIcon>
      <Icon name={icon} size={22} />
    </StatIcon>
    <div>
      <StatValue>{value}</StatValue>
      <StatLabel>{label}</StatLabel>
    </div>
  </StyledStatCard>
);
