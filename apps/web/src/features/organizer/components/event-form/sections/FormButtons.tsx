import React from 'react';
import { Button } from '@/shared/ui/button';
import { FormActions } from '../styles';
import type { EventFormIntent, EventFormProps } from '../types';

type FormButtonsProps = Pick<
  EventFormProps,
  'mode' | 'onCancel' | 'submittingIntent'
> & {
  /** A go-live time is set: publishing schedules the event. */
  isScheduling?: boolean;
};

/**
 * Cancel plus the submit buttons. Each submit button carries its intent
 * (`draft`, `publish`, `save`) so the form knows which one was pressed.
 */
export const FormButtons = ({
  mode,
  onCancel,
  submittingIntent,
  isScheduling = false
}: FormButtonsProps) => {
  const isSubmitting = submittingIntent !== undefined;
  const submitButton = (
    intent: EventFormIntent,
    label: string,
    variant?: 'secondary'
  ) => (
    <Button
      type="submit"
      name="intent"
      value={intent}
      variant={variant}
      isLoading={submittingIntent === intent}
      disabled={isSubmitting}
    >
      {label}
    </Button>
  );

  return (
    <FormActions>
      {onCancel ? (
        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      ) : null}
      {mode === 'create' ? (
        <>
          {submitButton('draft', 'Save as draft', 'secondary')}
          {submitButton(
            'publish',
            isScheduling ? 'Schedule event' : 'Publish event'
          )}
        </>
      ) : (
        submitButton('save', 'Save changes')
      )}
    </FormActions>
  );
};
