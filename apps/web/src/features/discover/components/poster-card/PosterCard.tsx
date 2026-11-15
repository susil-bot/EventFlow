import React from 'react';
import type { EventDto } from '@/shared/api/types';
import { EventCover } from '@/features/events/components/event-cover';
import { PhaseChip } from '@/features/events/components/phase-chip';
import {
  CATEGORY_LABEL,
  EVENT_TYPE_LABEL,
  formatPrice,
  getAvailability
} from '@/features/events/utils/event-format';
import { formatDistance } from '@/features/location/utils/geo';
import {
  CardMeta,
  CardPlace,
  CardTitle,
  CardTitleLink,
  DateStrip,
  Poster,
  PriceLine,
  StaffStatus,
  StatusTag,
  StyledPosterCard
} from './styles';

export type PosterCardProps = {
  event: EventDto;
  /**
   * The viewer manages this event: show its status chip on the poster when
   * it isn't simply live (scheduled, draft, expired, ended or canceled).
   */
  showStaffStatus?: boolean;
};

/** "Sun, 15 Nov" in the event's own time zone. */
const formatPosterDate = ({ startsAt, timeZone }: EventDto) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }).formatToParts(new Date(startsAt));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? '';
  return `${part('weekday')}, ${part('day')} ${part('month')}`;
};

/** "Online", or the venue plus its city when the venue doesn't name it. */
const placeLabel = (event: EventDto) => {
  if (event.eventType === 'ONLINE') {
    return 'Online';
  }
  const city = event.city?.name;
  return city && !event.venue.toLowerCase().includes(city.toLowerCase())
    ? `${event.venue}, ${city}`
    : event.venue;
};

/**
 * Tall poster card for Discover: cover with a date strip, then title,
 * place, category and price. The whole card is clickable through the title
 * link, so there is a single link per card for screen readers.
 */
export const PosterCard = ({
  event,
  showStaffStatus = false
}: PosterCardProps) => {
  const availability = getAvailability(event);
  const distance = formatDistance(event.distanceKm);
  const multiDay = event.slots.length > 1;
  const showStatus = availability.tone !== 'success';
  // Live is the normal state on Discover, so it gets no chip.
  const showPhase = showStaffStatus && event.phase !== 'LIVE';

  return (
    <StyledPosterCard aria-labelledby={`poster-${event.id}`}>
      {showPhase ? (
        <StaffStatus>
          <PhaseChip event={event} />
        </StaffStatus>
      ) : null}
      <Poster>
        <EventCover
          title={event.title}
          size="poster"
          muted={event.status === 'CANCELED'}
          imageUrl={event.images[0]?.url}
        />
        {showStatus ? (
          <StatusTag $tone={availability.tone}>{availability.label}</StatusTag>
        ) : null}
        <DateStrip>
          <time dateTime={event.startsAt}>{formatPosterDate(event)}</time>
          {multiDay ? ' onwards' : null}
        </DateStrip>
      </Poster>
      <CardTitle id={`poster-${event.id}`}>
        <CardTitleLink to={`/events/${event.slug}`}>
          {event.title}
        </CardTitleLink>
      </CardTitle>
      <CardPlace title={placeLabel(event)}>{placeLabel(event)}</CardPlace>
      <CardMeta>
        {CATEGORY_LABEL[event.category]} · {EVENT_TYPE_LABEL[event.eventType]}
      </CardMeta>
      <PriceLine>
        <strong>{formatPrice(event.price)}</strong>
        {distance ? <span>{distance}</span> : null}
        {showStatus ? null : <span>{availability.label}</span>}
      </PriceLine>
    </StyledPosterCard>
  );
};
