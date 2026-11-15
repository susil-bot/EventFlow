import React from 'react';
import type { EventDto } from '@/shared/api/types';
import { PosterCard } from '../poster-card';
import { StyledGrid } from './styles';

export type EventGridProps = {
  events: EventDto[];
  /** Events the viewer manages get a status chip (organizer or admin). */
  canManage?: (event: EventDto) => boolean;
};

/** Responsive grid of poster cards (four across on wide screens). */
export const EventGrid = ({ events, canManage }: EventGridProps) => (
  <StyledGrid>
    {events.map((event) => (
      <li key={event.id}>
        <PosterCard
          event={event}
          showStaffStatus={canManage?.(event) ?? false}
        />
      </li>
    ))}
  </StyledGrid>
);
