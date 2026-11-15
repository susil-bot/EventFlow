import React from 'react';
import type { EventDto } from '@/shared/api/types';
import { PhaseChip } from '@/features/events/components/phase-chip';
import { formatEventShort } from '@/features/events/utils/event-format';
import { LinkButton } from '@/shared/ui/button';
import {
  StyledTable,
  TableWrapper
} from '@/features/organizer/components/attendee-table/styles';
import { ReasonAction } from '../reason-action';
import { Actions, Reason, TitleCell, TitleLink } from './styles';

export type AdminEventTableProps = {
  events: EventDto[];
  onCancel: (eventId: string, reason: string) => void;
  /** Event with a cancel request in flight. */
  cancelingId?: string;
};

/**
 * Every event on the platform. Admins open any event in the editor (where
 * publish and unpublish ask for confirmation) and can cancel one here
 * with a reason. Each action is audited.
 */
export const AdminEventTable = ({
  events,
  onCancel,
  cancelingId
}: AdminEventTableProps) => (
  <TableWrapper>
    <StyledTable>
      <caption>All events</caption>
      <thead>
        <tr>
          <th scope="col">Event</th>
          <th scope="col">Organizer</th>
          <th scope="col">Status</th>
          <th scope="col">Registered</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {events.map((event) => (
          <tr key={event.id}>
            <td>
              <TitleCell>
                <TitleLink to={`/events/${event.id}`}>{event.title}</TitleLink>
                <time dateTime={event.startsAt}>
                  {formatEventShort(event)} · {event.timeZone}
                </time>
              </TitleCell>
            </td>
            <td>{event.organizerName}</td>
            <td>
              <PhaseChip event={event} />
            </td>
            <td>
              {event.registeredCount} / {event.capacity}
            </td>
            <td>
              {event.status === 'CANCELED' ? (
                <Reason>
                  {event.cancellationReason ?? 'Canceled by organizer'}
                </Reason>
              ) : (
                <Actions>
                  {event.hasStarted ? null : (
                    <LinkButton
                      to={`/admin/events/${event.id}/edit`}
                      variant="secondary"
                      size="sm"
                      aria-label={`Edit ${event.title}`}
                    >
                      Edit
                    </LinkButton>
                  )}
                  <ReasonAction
                    label="Cancel"
                    ariaLabel={`Cancel ${event.title}`}
                    confirmLabel="Cancel event"
                    hint="Shown to registered attendees and kept in the audit log."
                    isLoading={cancelingId === event.id}
                    onConfirm={(reason) => onCancel(event.id, reason)}
                  />
                </Actions>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </StyledTable>
  </TableWrapper>
);
