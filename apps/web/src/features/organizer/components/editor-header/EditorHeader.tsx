import React from 'react';
import { Link } from 'react-router';
import type { EventDto } from '@/shared/api/types';
import { Icon } from '@/shared/ui/icon';
import { PhaseChip } from '@/features/events/components/phase-chip';
import { formatEventShort } from '@/features/events/utils/event-format';
import {
  Eyebrow,
  Meta,
  MetaLink,
  StatusRow,
  StyledEditorHeader,
  Title
} from './styles';

export type EditorHeaderProps = {
  /** The saved event; omit when creating one. */
  event?: EventDto;
  /** Where its attendee list lives (omit to hide the link). */
  attendeesHref?: string;
  /** Shown above the title, e.g. "Admin". */
  eyebrow?: string;
};

const modifiedFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});
const modifiedTime = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
});

/** "Last modified on 13 November 2026 at 13:41 by Olivia Organizer". */
export const describeLastModified = (event: EventDto) => {
  const at = new Date(event.updatedAt);
  const by = event.lastEditedBy ? ` by ${event.lastEditedBy.name}` : '';
  return `Last modified on ${modifiedFormat.format(at)} at ${modifiedTime.format(at)}${by}`;
};

/**
 * Top of the event editor: title, who changed it last, and a status row
 * with its phase, start time, registrations and a link to the live page.
 */
export const EditorHeader = ({
  event,
  attendeesHref,
  eyebrow
}: EditorHeaderProps) => {
  if (!event) {
    return (
      <StyledEditorHeader>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <Title>Create event</Title>
        <Meta>
          Save as a draft to keep working on it, or publish to open
          registrations.
        </Meta>
      </StyledEditorHeader>
    );
  }
  const registrations = `${event.registeredCount} ${
    event.registeredCount === 1 ? 'registration' : 'registrations'
  }`;
  return (
    <StyledEditorHeader>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Title>Edit event</Title>
      <Meta>{describeLastModified(event)}</Meta>
      <StatusRow>
        <PhaseChip event={event} />
        <span>
          <time dateTime={event.startsAt}>{formatEventShort(event)}</time> ·{' '}
          {event.timeZone}
        </span>
        {attendeesHref ? (
          <MetaLink as={Link} to={attendeesHref}>
            <Icon name="users" size={16} />
            {registrations}
          </MetaLink>
        ) : (
          <span>{registrations}</span>
        )}
        <MetaLink href={`/events/${event.slug}`} target="_blank" rel="noopener">
          <Icon name="external" size={16} />
          View event page
        </MetaLink>
      </StatusRow>
    </StyledEditorHeader>
  );
};
