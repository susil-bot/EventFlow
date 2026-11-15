import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/app/providers/AuthProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { useEvent } from '@/features/events/hooks/use-events';
import { describePhase } from '@/features/events/utils/event-phase';
import { useCities } from '@/features/location/hooks/use-cities';
import { getErrorMessage, getFieldErrors } from '@/shared/api/client';
import type { EventInput } from '@/shared/api/types';
import { useLeaveGuard } from '@/shared/hooks/use-leave-guard';
import { LinkButton } from '@/shared/ui/button';
import { StateView } from '@/shared/ui/state-view';
import { EditorActions } from '../../components/editor-actions';
import { EditorHeader } from '../../components/editor-header';
import { EventForm, type EventFormIntent } from '../../components/event-form';
import {
  usePublishEvent,
  useUpdateEvent,
  useUploadImage
} from '../../hooks/use-event-mutations';
import { ConfirmDialog } from './ConfirmDialog';
import { LeaveDialog } from './LeaveDialog';
import { PublishStep } from './PublishStep';
import { useEditorMenu } from './use-editor-menu';

/**
 * Edit a saved event. Save keeps you in the editor; on a draft, Publish
 * (or Schedule) saves first, then publishes. Organizers edit their own
 * events; admins can edit any (the API records it in the audit log).
 */
export const EditEventPage = ({ id }: { id: string }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { data: event, isLoading, error, refetch } = useEvent(id);
  const update = useUpdateEvent(id);
  const publish = usePublishEvent();
  const upload = useUploadImage();
  const { data: cities } = useCities();
  const [intent, setIntent] = useState<EventFormIntent>();
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  // Asks before any navigation away (Back, links, Close, the "···" menu)
  // loses unsaved changes.
  const leave = useLeaveGuard(isDirty);

  const isAdmin = user?.role === 'ADMIN';
  const backTo = isAdmin ? '/admin/events' : '/organizer';
  const notOwner = event && user && !isAdmin && event.organizerId !== user.id;
  const menu = useEditorMenu(event, isAdmin);

  const handleSubmit = async (
    input: EventInput,
    nextIntent: EventFormIntent
  ) => {
    setIntent(nextIntent);
    try {
      await update.mutateAsync(input);
      if (nextIntent === 'publish') {
        const published = await publish.mutateAsync(id);
        toast.success(
          published.phase === 'SCHEDULED'
            ? `Scheduled. ${describePhase(published) ?? ''}`.trim()
            : `"${published.title}" is now live.`
        );
      } else {
        toast.success('Changes saved.');
      }
    } catch (reason) {
      toast.error(getErrorMessage(reason));
    } finally {
      setIntent(undefined);
    }
  };

  return (
    <StateView
      isLoading={isLoading}
      loadingLabel="Loading event"
      error={
        error ??
        (notOwner
          ? new Error('You can only edit events that you organize.')
          : null)
      }
      onRetry={notOwner ? undefined : () => void refetch()}
      errorTitle={notOwner ? "This isn't your event" : undefined}
      errorAction={
        <LinkButton to={backTo} variant="secondary">
          Back to dashboard
        </LinkButton>
      }
    >
      {event && !notOwner ? (
        <>
          <EventForm
            key={event.updatedAt}
            mode="edit"
            initialValues={event}
            cities={cities}
            minCapacity={event.registeredCount}
            header={
              <EditorHeader
                event={event}
                eyebrow={
                  isAdmin
                    ? `Admin · organized by ${event.organizerName} · changes are audited`
                    : undefined
                }
                attendeesHref={
                  isAdmin
                    ? undefined
                    : `/organizer/events/${event.id}/attendees`
                }
              />
            }
            onSubmit={(input, nextIntent) =>
              void handleSubmit(input, nextIntent)
            }
            // Uploads belong to the organizer: for admins the image section
            // is hidden and the existing images are kept as they are.
            onUploadImage={isAdmin ? undefined : upload.mutateAsync}
            onDirtyChange={setIsDirty}
            serverErrors={getFieldErrors(update.error)}
            submittingIntent={intent}
            formId="event-editor"
            renderActions={(form) => (
              <>
                <EditorActions
                  formId="event-editor"
                  mode="edit"
                  phase={event.phase}
                  isDirty={form.isDirty}
                  isScheduling={form.isScheduling}
                  submittingIntent={intent}
                  previewHref={`/events/${event.slug}`}
                  menuItems={menu.items}
                  onPublish={() => setIsPublishOpen(true)}
                  onExit={() => navigate(backTo)}
                />
                <PublishStep
                  open={isPublishOpen}
                  form={form}
                  isPublishing={intent === 'publish'}
                  onClose={() => setIsPublishOpen(false)}
                />
              </>
            )}
          />
          <LeaveDialog
            blocker={leave.blocker}
            message="You have unsaved changes to this event. If you leave now, they will be lost."
          />
          <ConfirmDialog
            {...menu.unpublishDialog}
            title="Unpublish this event?"
            message={`"${event.title}" goes back to draft: it leaves Discover and its page is hidden from attendees until you publish it again.`}
            confirmLabel="Unpublish"
            cancelLabel="Keep it published"
          />
          <ConfirmDialog
            {...menu.cancelDialog}
            title="Cancel this event?"
            message={`"${event.title}" will be marked as canceled and nobody can register. This can't be undone.`}
            acknowledgement={
              event.registeredCount > 0
                ? `I understand the ${event.registeredCount} registered ${event.registeredCount === 1 ? 'person' : 'people'} will see this event as canceled.`
                : undefined
            }
            confirmLabel="Cancel event"
            cancelLabel="Keep event"
            danger
          />
        </>
      ) : null}
    </StateView>
  );
};
