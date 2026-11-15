import React from 'react';
import { useToast } from '@/app/providers/ToastProvider';
import type { EventFormActionState } from '../../components/event-form';
import { PublishDialog } from '../../components/publish-dialog';

type PublishStepProps = {
  open: boolean;
  form: EventFormActionState;
  isPublishing: boolean;
  onClose: () => void;
};

/**
 * Connects the Publish dialog to the form: the chosen go-live time is
 * written into the form and the form is submitted with the `publish`
 * intent. If the form has errors, the dialog closes so they can be seen.
 */
export const PublishStep = ({
  open,
  form,
  isPublishing,
  onClose
}: PublishStepProps) => {
  const toast = useToast();
  if (!open) {
    return null;
  }
  return (
    <PublishDialog
      open
      values={form.values}
      isPublishing={isPublishing}
      onClose={onClose}
      onConfirm={(publishAtLocal) => {
        const submitted = form.submit('publish', {
          scheduleGoLive: publishAtLocal !== null,
          publishAtLocal: publishAtLocal ?? ''
        });
        onClose();
        if (!submitted) {
          toast.error(
            'Please correct the highlighted fields before publishing.'
          );
        }
      }}
    />
  );
};
