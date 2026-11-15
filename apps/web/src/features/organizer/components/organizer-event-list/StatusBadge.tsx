import React from 'react';
import type { EventDto } from '@/shared/api/types';
import { Icon, type IconName } from '@/shared/ui/icon';
import {
  formatGoLiveShort,
  PHASE_LABEL,
  type PhaseTone
} from '@/features/events/utils/event-phase';
import { StyledStatusBadge } from './styles';

type Badge = { icon: IconName; text?: string; tone: PhaseTone; label: string };

/** What the compact status shows for each phase. */
export const statusBadgeFor = (event: EventDto, now = new Date()): Badge => {
  switch (event.phase) {
    case 'LIVE':
      return {
        icon: 'liveCheck',
        text: 'Live',
        tone: 'success',
        label: 'Live'
      };
    case 'SCHEDULED': {
      const when = event.publishAt
        ? formatGoLiveShort(event.publishAt, event.timeZone, now)
        : 'Scheduled';
      return {
        icon: 'hourglass',
        text: when,
        tone: 'warning',
        label: `Scheduled: goes live ${when}`
      };
    }
    case 'DRAFT':
      return { icon: 'edit', tone: 'neutral', label: 'Draft' };
    case 'EXPIRED':
      return {
        icon: 'hourglass',
        text: 'Listing ended',
        tone: 'neutral',
        label: 'Expired: listing ended'
      };
    case 'ENDED':
      return { icon: 'clock', text: 'Ended', tone: 'neutral', label: 'Ended' };
    case 'CANCELED':
      return {
        icon: 'close',
        text: PHASE_LABEL.CANCELED,
        tone: 'danger',
        label: 'Canceled'
      };
  }
};

/** Compact phase badge for list rows (icon, and a short time or label). */
export const StatusBadge = ({ event }: { event: EventDto }) => {
  const badge = statusBadgeFor(event);
  return (
    <StyledStatusBadge
      $tone={badge.tone}
      title={badge.label}
      aria-label={badge.label}
      role="img"
    >
      <Icon name={badge.icon} size={18} />
      {badge.text ? <span aria-hidden="true">{badge.text}</span> : null}
    </StyledStatusBadge>
  );
};
