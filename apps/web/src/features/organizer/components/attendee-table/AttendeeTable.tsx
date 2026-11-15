import React from 'react';
import type { AttendeeDto } from '@/shared/api/types';
import { formatTimestamp } from '@/features/events/utils/event-format';
import { Avatar } from '@/shared/ui/avatar';
import { NameCell, StyledTable, TableWrapper } from './styles';

export type AttendeeTableProps = {
  attendees: AttendeeDto[];
  caption?: string;
};

export const AttendeeTable = ({
  attendees,
  caption = 'Registered attendees'
}: AttendeeTableProps) => {
  const showSlot = attendees.some((attendee) => attendee.slotLabel !== null);
  return (
    <TableWrapper>
      <StyledTable>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            {showSlot ? <th scope="col">Time slot</th> : null}
            <th scope="col">Registered</th>
          </tr>
        </thead>
        <tbody>
          {attendees.map((attendee) => (
            <tr key={attendee.registrationId}>
              <td>
                <NameCell>
                  <Avatar name={attendee.name} size="sm" />
                  {attendee.name}
                </NameCell>
              </td>
              <td>
                <a href={`mailto:${attendee.email}`}>{attendee.email}</a>
              </td>
              {showSlot ? <td>{attendee.slotLabel ?? '—'}</td> : null}
              <td>
                <time dateTime={attendee.registeredAt}>
                  {formatTimestamp(attendee.registeredAt)}
                </time>
              </td>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </TableWrapper>
  );
};
