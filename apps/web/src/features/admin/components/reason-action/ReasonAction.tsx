import React, { type FormEvent, useId, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { ReasonForm, ReasonFormActions } from './styles';

export type ReasonActionProps = {
  /** Text of the button that opens the prompt, e.g. "Suspend". */
  label: string;
  /** Accessible name for the opening button, e.g. "Suspend Oscar". */
  ariaLabel?: string;
  /** Text of the confirm button, e.g. "Suspend account". */
  confirmLabel: string;
  /** Explains who sees the reason. */
  hint?: string;
  isLoading?: boolean;
  onConfirm: (reason: string) => void;
};

const MIN_REASON = 3;

/**
 * A destructive action that needs a written reason (kept in the audit log):
 * a button that expands into a short form with Confirm / Keep.
 */
export const ReasonAction = ({
  label,
  ariaLabel,
  confirmLabel,
  hint = 'Recorded in the audit log.',
  isLoading = false,
  onConfirm
}: ReasonActionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string>();
  const formId = useId();

  if (!isOpen) {
    return (
      <Button
        size="sm"
        variant="danger"
        aria-label={ariaLabel}
        onClick={() => setIsOpen(true)}
      >
        {label}
      </Button>
    );
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = reason.trim();
    if (trimmed.length < MIN_REASON) {
      setError(`Reason must be at least ${MIN_REASON} characters.`);
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <ReasonForm
      id={formId}
      onSubmit={handleSubmit}
      noValidate
      aria-label={ariaLabel ?? label}
    >
      <TextField
        label="Reason"
        value={reason}
        onChange={(event) => {
          setReason(event.target.value);
          setError(undefined);
        }}
        error={error}
        hint={hint}
        maxLength={500}
        required
      />
      <ReasonFormActions>
        <Button type="submit" size="sm" variant="danger" isLoading={isLoading}>
          {confirmLabel}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={isLoading}
          onClick={() => {
            setIsOpen(false);
            setReason('');
            setError(undefined);
          }}
        >
          Keep
        </Button>
      </ReasonFormActions>
    </ReasonForm>
  );
};
