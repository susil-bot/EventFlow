import React from 'react';
import type { EventDto } from '@/shared/api/types';
import { StatCard } from '@/shared/ui/stat-card';
import { StyledStats } from './styles';

export type DashboardStatsProps = {
  events: EventDto[];
};

export const summarizeEvents = (events: EventDto[]) => {
  const live = events.filter(
    (event) => event.status === 'PUBLISHED' && !event.hasStarted
  );
  return {
    total: events.length,
    live: live.length,
    registered: live.reduce((sum, event) => sum + event.registeredCount, 0),
    available: live.reduce((sum, event) => sum + event.availablePlaces, 0)
  };
};

export const DashboardStats = ({ events }: DashboardStatsProps) => {
  const totals = summarizeEvents(events);
  return (
    <StyledStats aria-label="Summary">
      <StatCard label="Total events" value={totals.total} icon="calendar" />
      <StatCard label="Live & upcoming" value={totals.live} icon="sparkle" />
      <StatCard
        label="Active registrations"
        value={totals.registered}
        icon="users"
      />
      <StatCard
        label="Places available"
        value={totals.available}
        icon="ticket"
      />
    </StyledStats>
  );
};
