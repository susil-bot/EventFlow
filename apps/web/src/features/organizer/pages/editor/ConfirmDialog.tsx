import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Modal } from '@/shared/ui/modal';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Red confirm button for destructive actions. */
  danger?: boolean;
  /**
   * A statement the user must tick before confirming, for actions with
   * consequences for other people (e.g. canceling with registrations).
   */
  acknowledgement?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const Body = ({
  message,
  confirmLabel,
  cancelLabel,
  danger,
  acknowledgement,
  isConfirming,
  onConfirm,
  onClose
}: Omit<ConfirmDialogProps, 'open' | 'title'>) => {
  const [acknowledged, setAcknowledged] = useState(false);
  return (
    <>
      <p>{message}</p>
      {acknowledgement ? (
        <Checkbox
          label={acknowledgement}
          checked={acknowledged}
          onChange={(event) => setAcknowledged(event.target.checked)}
        />
      ) : null}
      <p>
        <Button
          variant={danger ? 'danger' : 'primary'}
          isLoading={isConfirming}
          disabled={Boolean(acknowledgement) && !acknowledged}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>{' '}
        <Button variant="ghost" onClick={onClose} disabled={isConfirming}>
          {cancelLabel}
        </Button>
      </p>
    </>
  );
};

/**
 * Yes/no question in a modal (leave with unsaved changes, unpublish,
 * cancel). The body remounts on each opening, so the acknowledgement
 * checkbox always starts unticked.
 */
export const ConfirmDialog = ({ open, title, ...rest }: ConfirmDialogProps) => (
  <Modal open={open} title={title} onClose={rest.onClose}>
    {open ? <Body {...rest} danger={rest.danger ?? false} /> : null}
  </Modal>
);
