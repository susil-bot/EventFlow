import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useToast } from '@/app/providers/ToastProvider';
import { canUnpublish } from '@/features/events/utils/event-phase';
import { getErrorMessage } from '@/shared/api/client';
import type { EventDto } from '@/shared/api/types';
import type { ActionMenuItem } from '@/shared/ui/action-menu';
import {
  useCancelEvent,
  useUnpublishEvent
} from '../../hooks/use-event-mutations';

type Pending = 'unpublish' | 'cancel' | undefined;

/**
 * The editor's "···" actions for a saved event: attendees, unpublish and
 * cancel. Each change asks for confirmation first; canceling an event
 * people registered for also needs an explicit acknowledgement. Admins
 * give a reason on the All events page, which goes to the audit log.
 */
export const useEditorMenu = (
  event: EventDto | undefined,
  isAdmin: boolean
) => {
  const navigate = useNavigate();
  const toast = useToast();
  const unpublish = useUnpublishEvent();
  const cancel = useCancelEvent();
  const [confirming, setConfirming] = useState<Pending>();
  const close = () => setConfirming(undefined);

  const items: ActionMenuItem[] = [];
  if (event && !isAdmin) {
    items.push({
      label: 'View attendees',
      onSelect: () => navigate(`/organizer/events/${event.id}/attendees`)
    });
  }
  if (event && canUnpublish(event)) {
    items.push({
      label: 'Unpublish…',
      onSelect: () => setConfirming('unpublish')
    });
  }
  if (event && event.status !== 'CANCELED' && !event.hasStarted) {
    items.push(
      isAdmin
        ? {
            label: 'Cancel with a reason…',
            tone: 'danger',
            onSelect: () => navigate('/admin/events')
          }
        : {
            label: 'Cancel event…',
            tone: 'danger',
            onSelect: () => setConfirming('cancel')
          }
    );
  }

  const confirmUnpublish = () => {
    if (!event) {
      return;
    }
    unpublish.mutate(event.id, {
      onSuccess: (saved) =>
        toast.success(
          `"${saved.title}" has been unpublished and moved back to draft.`
        ),
      onError: (reason) => toast.error(getErrorMessage(reason)),
      onSettled: close
    });
  };

  const confirmCancel = () => {
    if (!event) {
      return;
    }
    cancel.mutate(event.id, {
      onSuccess: (saved) => {
        toast.success(`"${saved.title}" has been canceled.`);
        navigate('/organizer');
      },
      onError: (reason) => toast.error(getErrorMessage(reason)),
      onSettled: close
    });
  };

  return {
    items,
    unpublishDialog: {
      open: confirming === 'unpublish',
      isConfirming: unpublish.isPending,
      onConfirm: confirmUnpublish,
      onClose: close
    },
    cancelDialog: {
      open: confirming === 'cancel',
      isConfirming: cancel.isPending,
      onConfirm: confirmCancel,
      onClose: close
    }
  };
};
