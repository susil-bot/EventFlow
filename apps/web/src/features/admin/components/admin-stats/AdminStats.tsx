import React from 'react';
import type { PlatformStats } from '@/shared/api/types';
import { StatCard } from '@/shared/ui/stat-card';
import { StyledStats } from '@/features/organizer/components/dashboard-stats/styles';

export type AdminStatsProps = {
  stats: PlatformStats;
};

/** Headline platform numbers for the admin overview. */
export const AdminStats = ({ stats }: AdminStatsProps) => (
  <StyledStats aria-label="Platform summary">
    <StatCard
      label="Organizers awaiting approval"
      value={stats.pendingOrganizers}
      icon="clock"
    />
    <StatCard
      label="Upcoming published events"
      value={stats.upcomingPublishedEvents}
      icon="calendar"
    />
    <StatCard
      label="Active registrations"
      value={stats.activeRegistrations}
      icon="ticket"
    />
    <StatCard
      label="Users (organizers / attendees)"
      value={`${stats.users.ORGANIZER} / ${stats.users.ATTENDEE}`}
      icon="users"
    />
    <StatCard
      label="Suspended accounts"
      value={stats.suspendedUsers}
      icon="alert"
    />
  </StyledStats>
);
