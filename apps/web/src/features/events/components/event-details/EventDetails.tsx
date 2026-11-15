import React, { type ReactNode } from 'react';
import type { EventDto } from '@/shared/api/types';
import {
  CATEGORY_LABEL,
  EVENT_TYPE_LABEL,
  formatEventDay,
  formatEventTime,
  formatPrice,
  formatSlotRange,
  getDateBadgeParts,
  STATUS_LABEL
} from '../../utils/event-format';
import { Avatar } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { DateBadge } from '@/shared/ui/date-badge';
import { Icon } from '@/shared/ui/icon';
import { directionsUrl, VenueMap } from '@/shared/ui/venue-map';
import { EventCover } from '../event-cover';
import { PhaseChip } from '../phase-chip';
import { EventMetaRow } from '../event-meta-row';
import { SocialLinks } from '../social-links';
import {
  Aside,
  BadgeRow,
  CoverWrap,
  Description,
  DetailsColumn,
  DirectionsLink,
  Gallery,
  GalleryImage,
  HostRow,
  Section,
  SectionTitle,
  SlotItem,
  SlotList,
  SlotPlaces,
  StaffStatus,
  StyledDetails,
  Title
} from './styles';

export type EventDetailsProps = {
  event: EventDto;
  /** Registration card (or organizer actions) rendered under the schedule. */
  registrationSlot: ReactNode;
  /** The viewer manages this event: show its status chip on the cover. */
  showStaffStatus?: boolean;
};

const placesLabel = (available: number) => {
  if (available === 0) {
    return 'Full';
  }
  return `${available} ${available === 1 ? 'place' : 'places'} left`;
};

/** Luma-style event page: cover + host on the left, details on the right. */
export const EventDetails = ({
  event,
  registrationSlot,
  showStaffStatus = false
}: EventDetailsProps) => {
  const [cover, ...gallery] = event.images;
  const hasVenue = event.eventType !== 'ONLINE' || event.venue !== 'Online';

  return (
    <StyledDetails>
      <Aside>
        <CoverWrap>
          <EventCover
            title={event.title}
            size="hero"
            muted={event.status === 'CANCELED'}
            imageUrl={cover?.url}
          />
          {showStaffStatus ? (
            <StaffStatus>
              <PhaseChip event={event} variant="overlay" />
            </StaffStatus>
          ) : null}
        </CoverWrap>
        {gallery.length > 0 ? (
          <Gallery aria-label="More images">
            {gallery.map((image, index) => (
              <li key={image.id}>
                <GalleryImage
                  src={image.url}
                  alt={`${event.title} image ${index + 2}`}
                  loading="lazy"
                />
              </li>
            ))}
          </Gallery>
        ) : null}
        <Section>
          <SectionTitle>Hosted by</SectionTitle>
          <HostRow>
            <Avatar name={event.organizerName} />
            <strong>{event.organizerName}</strong>
          </HostRow>
        </Section>
        {event.socialLinks.length > 0 ? (
          <Section>
            <SectionTitle>Links</SectionTitle>
            <SocialLinks links={event.socialLinks} />
          </Section>
        ) : null}
      </Aside>

      <DetailsColumn>
        <BadgeRow>
          {event.status === 'PUBLISHED' ? (
            <Badge tone="info">
              <Icon name="sparkle" size={14} /> Public event
            </Badge>
          ) : (
            <Badge tone={event.status === 'CANCELED' ? 'danger' : 'neutral'}>
              {STATUS_LABEL[event.status]}
            </Badge>
          )}
          <Badge tone="neutral">
            <Icon name="tag" size={14} /> {CATEGORY_LABEL[event.category]}
          </Badge>
          <Badge tone="neutral">
            <Icon
              name={event.eventType === 'IN_PERSON' ? 'pin' : 'video'}
              size={14}
            />{' '}
            {EVENT_TYPE_LABEL[event.eventType]}
          </Badge>
        </BadgeRow>
        <Title>{event.title}</Title>

        <EventMetaRow
          leading={<DateBadge {...getDateBadgeParts(event)} />}
          primary={
            <time dateTime={event.startsAt}>{formatEventDay(event)}</time>
          }
          secondary={
            event.slots.length > 0
              ? `${event.slots.length} time slots · ${event.timeZone}`
              : `${formatEventTime(event)} · ${event.timeZone}`
          }
        />
        {hasVenue ? (
          <EventMetaRow
            icon="pin"
            primary={event.venue}
            secondary={event.city ? `Venue · ${event.city.name}` : 'Venue'}
          />
        ) : null}
        {event.eventType === 'IN_PERSON' ? null : (
          <EventMetaRow
            icon="video"
            primary={
              event.onlineUrl ? (
                <a
                  href={event.onlineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join online
                </a>
              ) : (
                'Online'
              )
            }
            secondary={
              event.onlineUrl
                ? 'Meeting link'
                : 'The meeting link is shared with registered attendees.'
            }
          />
        )}
        <EventMetaRow
          icon="tag"
          primary={formatPrice(event.price)}
          secondary="Ticket price"
        />
        <EventMetaRow
          icon="users"
          primary={`${event.availablePlaces} of ${event.capacity} places remaining`}
          secondary={`${event.registeredCount} registered`}
        />

        {registrationSlot}

        {event.slots.length > 0 ? (
          <Section>
            <SectionTitle>Time slots</SectionTitle>
            <SlotList>
              {event.slots.map((slot) => (
                <SlotItem key={slot.id}>
                  <Icon name="clock" size={18} />
                  <span>
                    <strong>{slot.label}</strong>
                    <br />
                    <time dateTime={slot.startsAt}>
                      {formatSlotRange(slot, event.timeZone)}
                    </time>
                  </span>
                  <SlotPlaces $full={slot.availablePlaces === 0}>
                    {slot.hasStarted
                      ? 'Started'
                      : placesLabel(slot.availablePlaces)}
                  </SlotPlaces>
                </SlotItem>
              ))}
            </SlotList>
          </Section>
        ) : null}

        <Section>
          <SectionTitle>About event</SectionTitle>
          <Description>{event.description}</Description>
        </Section>

        {hasVenue ? (
          <Section>
            <SectionTitle>Location</SectionTitle>
            <EventMetaRow icon="pin" primary={event.venue} />
            {event.venueLocation ? (
              <>
                <VenueMap
                  location={event.venueLocation}
                  label={`Map of ${event.venue}`}
                />
                <DirectionsLink
                  href={directionsUrl(event.venueLocation)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Get directions (opens in a new tab)"
                >
                  Get directions <Icon name="external" size={14} />
                </DirectionsLink>
              </>
            ) : null}
          </Section>
        ) : null}
      </DetailsColumn>
    </StyledDetails>
  );
};
