import React from 'react';
import type { Blocker } from 'react-router';
import { ConfirmDialog } from './ConfirmDialog';

type LeaveDialogProps = {
  /** From `useLeaveGuard`: open while a navigation is held. */
  blocker: Blocker;
  message: string;
};

/**
 * "Leave without saving?" for a navigation held by `useLeaveGuard`
 * (a link, the browser's Back button or the editor's Close button).
 */
export const LeaveDialog = ({ blocker, message }: LeaveDialogProps) => (
  <ConfirmDialog
    open={blocker.state === 'blocked'}
    title="Leave without saving?"
    message={message}
    confirmLabel="Discard and leave"
    cancelLabel="Keep editing"
    danger
    onConfirm={() => {
      if (blocker.state === 'blocked') {
        blocker.proceed();
      }
    }}
    onClose={() => {
      if (blocker.state === 'blocked') {
        blocker.reset();
      }
    }}
  />
);
