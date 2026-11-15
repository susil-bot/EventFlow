import React from 'react';
import type { EventDto } from '@/shared/api/types';
import { ActionMenu, type ActionMenuItem } from '@/shared/ui/action-menu';
import { Icon } from '@/shared/ui/icon';
import { formatRelativeTime } from '@/shared/utils/relative-time';
import {
  CATEGORY_LABEL,
  EVENT_TYPE_LABEL,
  formatEventShort
} from '@/features/events/utils/event-format';
import { StatusBadge } from './StatusBadge';
import {
  Capacity,
  ListHeader,
  Meta,
  RowActions,
  RowMain,
  RowTitle,
  StyledEventList,
  StyledRow,
  Tag,
  Thumb,
  ThumbFallback
} from './styles';

export type OrganizerEventListProps = {
  events: EventDto[];
  /** Opens a URL in a new tab (injected for tests). */
  openInNewTab?: (url: string) => void;
  /** Client-side navigation (injected by the page). */
  onNavigate: (path: string) => void;
};

const editorPath = (event: EventDto) => `/organizer/events/${event.id}/edit`;
const isEditable = (event: EventDto) =>
  event.status !== 'CANCELED' && !event.hasStarted;

const updatedLine = (event: EventDto) =>
  `Updated ${formatRelativeTime(event.updatedAt)}${
    event.lastEditedBy ? ` by ${event.lastEditedBy.name}` : ''
  }`;

const defaultOpen = (url: string) => {
  window.open(url, '_blank', 'noopener');
};

/**
 * The organizer's events as a list: cover, title, category, format, when
 * it was last updated and by whom, places, a compact status, and a "···"
 * menu. Changes (publish, unpublish, cancel) happen in the editor, where
 * they ask for confirmation, not from a single click here.
 */
export const OrganizerEventList = ({
  events,
  openInNewTab = defaultOpen,
  onNavigate
}: OrganizerEventListProps) => (
  <StyledEventList aria-label="Your events">
    <ListHeader>
      1 - {events.length} of {events.length}{' '}
      {events.length === 1 ? 'event' : 'events'}
    </ListHeader>
    <ul>
      {events.map((event) => {
        const editable = isEditable(event);
        const isPublic = event.phase !== 'DRAFT' && event.phase !== 'SCHEDULED';
        const items: ActionMenuItem[] = [
          ...(editable
            ? [
                {
                  label: 'Edit',
                  onSelect: () => onNavigate(editorPath(event))
                },
                {
                  label: 'Open in new tab',
                  onSelect: () => openInNewTab(editorPath(event))
                }
              ]
            : []),
          {
            label: isPublic ? 'View event page' : 'Preview',
            onSelect: () => openInNewTab(`/events/${event.slug}`)
          },
          {
            label: 'View attendees',
            onSelect: () =>
              onNavigate(`/organizer/events/${event.id}/attendees`)
          }
        ];
        const cover = event.images[0]?.url;
        return (
          <StyledRow key={event.id}>
            {cover ? (
              <Thumb src={cover} alt="" loading="lazy" />
            ) : (
              <ThumbFallback aria-hidden="true">
                <Icon name="calendar" size={24} />
              </ThumbFallback>
            )}
            <RowMain>
              <RowTitle
                to={editable ? editorPath(event) : `/events/${event.slug}`}
              >
                {event.title}
              </RowTitle>
              <Meta>
                <strong>{CATEGORY_LABEL[event.category]}</strong>
                <Tag>{EVENT_TYPE_LABEL[event.eventType]}</Tag>
                <span>
                  <time dateTime={event.startsAt}>
                    {formatEventShort(event)}
                  </time>
                </span>
                <span>{updatedLine(event)}</span>
              </Meta>
              <Capacity>
                {event.registeredCount} / {event.capacity} registered
                {event.status === 'CANCELED'
                  ? ''
                  : ` · ${event.availablePlaces} ${
                      event.availablePlaces === 1 ? 'place' : 'places'
                    } left`}
              </Capacity>
            </RowMain>
            <RowActions>
              <StatusBadge event={event} />
              <ActionMenu label={`Actions for ${event.title}`} items={items} />
            </RowActions>
          </StyledRow>
        );
      })}
    </ul>
  </StyledEventList>
);
