import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useToast } from '@/app/providers/ToastProvider';
import { useCities } from '@/features/location/hooks/use-cities';
import { getErrorMessage, getFieldErrors } from '@/shared/api/client';
import type { EventInput } from '@/shared/api/types';
import { useLeaveGuard } from '@/shared/hooks/use-leave-guard';
import { EditorActions } from '../../components/editor-actions';
import { EditorHeader } from '../../components/editor-header';
import { EventForm, type EventFormIntent } from '../../components/event-form';
import {
  useCreateEvent,
  useUploadImage
} from '../../hooks/use-event-mutations';
import { LeaveDialog } from './LeaveDialog';
import { PublishStep } from './PublishStep';

const DASHBOARD = '/organizer';

/**
 * New event. Saving (as a draft or published) opens the event in the
 * editor, so the organizer can keep refining it.
 */
export const CreateEventPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const create = useCreateEvent();
  const upload = useUploadImage();
  const { data: cities } = useCities();
  const [intent, setIntent] = useState<EventFormIntent>();
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  // Asks before any navigation away (Back, links, Close) loses the input.
  const leave = useLeaveGuard(isDirty);

  const handleSubmit = (input: EventInput, nextIntent: EventFormIntent) => {
    setIntent(nextIntent);
    create.mutate(
      { ...input, publish: nextIntent === 'publish' },
      {
        onSuccess: (event) => {
          toast.success(
            event.phase === 'DRAFT'
              ? 'Draft saved. Publish it when you are ready.'
              : `"${event.title}" is ${event.phase === 'SCHEDULED' ? 'scheduled' : 'live'}.`
          );
          leave.allowNavigation();
          navigate(`/organizer/events/${event.id}/edit`, { replace: true });
        },
        onError: (reason) => toast.error(getErrorMessage(reason)),
        onSettled: () => setIntent(undefined)
      }
    );
  };

  return (
    <>
      <EventForm
        mode="create"
        cities={cities}
        header={<EditorHeader />}
        onSubmit={handleSubmit}
        onUploadImage={upload.mutateAsync}
        onDirtyChange={setIsDirty}
        serverErrors={getFieldErrors(create.error)}
        submittingIntent={create.isPending ? intent : undefined}
        formId="event-editor"
        renderActions={(form) => (
          <>
            <EditorActions
              formId="event-editor"
              mode="create"
              isDirty={form.isDirty}
              isScheduling={form.isScheduling}
              submittingIntent={create.isPending ? intent : undefined}
              onPublish={() => setIsPublishOpen(true)}
              onExit={() => navigate(DASHBOARD)}
            />
            <PublishStep
              open={isPublishOpen}
              form={form}
              isPublishing={create.isPending && intent === 'publish'}
              onClose={() => setIsPublishOpen(false)}
            />
          </>
        )}
      />
      <LeaveDialog
        blocker={leave.blocker}
        message="This event hasn't been saved yet. If you leave now, everything you entered will be lost."
      />
    </>
  );
};
