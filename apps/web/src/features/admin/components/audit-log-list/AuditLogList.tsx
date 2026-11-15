import React from 'react';
import type { AdminAction, AuditEntry } from '@/shared/api/types';
import { Entry, EntryMeta, EntryReason, StyledList } from './styles';

export type AuditLogListProps = {
  entries: AuditEntry[];
};

const ACTION_LABEL: Record<AdminAction, string> = {
  APPROVE_ORGANIZER: 'approved an organizer',
  SUSPEND_USER: 'suspended a user',
  REACTIVATE_USER: 'reactivated a user',
  CHANGE_ROLE: "changed a user's role",
  CANCEL_EVENT: 'canceled an event',
  EDIT_EVENT: 'edited an event',
  PUBLISH_EVENT: 'published an event',
  UNPUBLISH_EVENT: 'unpublished an event'
};

const timeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short'
});

/** Newest-first record of admin actions. */
export const AuditLogList = ({ entries }: AuditLogListProps) => (
  <StyledList aria-label="Audit log">
    {entries.map((entry) => (
      <Entry key={entry.id}>
        <div>
          <strong>{entry.adminName}</strong> {ACTION_LABEL[entry.action]}
          {entry.reason ? (
            <EntryReason>Reason: {entry.reason}</EntryReason>
          ) : null}
        </div>
        <EntryMeta>
          <time dateTime={entry.createdAt}>
            {timeFormat.format(new Date(entry.createdAt))}
          </time>
        </EntryMeta>
      </Entry>
    ))}
  </StyledList>
);
