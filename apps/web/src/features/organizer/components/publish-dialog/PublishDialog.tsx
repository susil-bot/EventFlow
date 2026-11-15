import React, { useState } from 'react';
import { formatLocalDateTime } from '@/features/events/utils/event-phase';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { SelectField } from '@/shared/ui/select-field';
import { TextField } from '@/shared/ui/text-field';
import { checkGoLive, type EventFormValues, firstStartOf } from '../event-form';
import { DialogActions, DialogBody, PageUrl, ZoneNote } from './styles';

type When = 'now' | 'planned' | 'custom';

export type PublishDialogValues = Pick<
  EventFormValues,
  | 'slug'
  | 'timeZone'
  | 'startsAtLocal'
  | 'slots'
  | 'scheduleGoLive'
  | 'publishAtLocal'
>;

export type PublishDialogProps = {
  open: boolean;
  values: PublishDialogValues;
  isPublishing?: boolean;
  /** `null` = live now; otherwise the go-live time (event's wall clock). */
  onConfirm: (publishAtLocal: string | null) => void;
  onClose: () => void;
};

/**
 * Confirmation before an event goes public: live now, at the planned
 * go-live time, or at a new one, with the page address it will have.
 * Publishing is deliberate; nothing goes live from a single stray click.
 */
export const PublishDialog = ({
  open,
  values,
  isPublishing = false,
  onConfirm,
  onClose
}: PublishDialogProps) => {
  const planned = values.scheduleGoLive ? values.publishAtLocal : '';
  const [when, setWhen] = useState<When>(planned ? 'planned' : 'now');
  const [custom, setCustom] = useState('');
  const [error, setError] = useState<string>();

  const options = [
    { value: 'now', label: 'Now' },
    ...(planned
      ? [
          {
            value: 'planned',
            label: `Planned go-live – ${formatLocalDateTime(planned)}`
          }
        ]
      : []),
    { value: 'custom', label: 'Pick a date and time' }
  ];

  const confirm = () => {
    if (when === 'now') {
      onConfirm(null);
      return;
    }
    const local = when === 'planned' ? planned : custom;
    const problem = checkGoLive(local, {
      firstStart: firstStartOf(values),
      timeZone: values.timeZone
    });
    setError(problem);
    if (!problem) {
      onConfirm(local);
    }
  };

  const pageUrl = `${window.location.origin}/events/${values.slug || '…'}`;

  return (
    <Modal open={open} title="Publish event" onClose={onClose}>
      <DialogBody>
        <SelectField
          label="Go live"
          options={options}
          value={when}
          onChange={(event) => {
            setWhen(event.target.value as When);
            setError(undefined);
          }}
          error={when === 'planned' ? error : undefined}
        />
        {when === 'custom' ? (
          <TextField
            label="Go-live date and time"
            type="datetime-local"
            value={custom}
            onChange={(event) => {
              setCustom(event.target.value);
              setError(undefined);
            }}
            error={error}
            required
          />
        ) : null}
        <ZoneNote>
          Times are in the event's time zone: <strong>{values.timeZone}</strong>
          .
          {when === 'now'
            ? ' It appears in Discover and opens for registration straight away.'
            : ' Until then it stays hidden from attendees.'}
        </ZoneNote>
        <div>
          <ZoneNote as="span">Event page</ZoneNote>
          <PageUrl>{pageUrl}</PageUrl>
        </div>
      </DialogBody>
      <DialogActions>
        <Button variant="secondary" onClick={onClose} disabled={isPublishing}>
          Cancel
        </Button>
        <Button onClick={confirm} isLoading={isPublishing}>
          {when === 'now' ? 'Publish' : 'Schedule'}
        </Button>
      </DialogActions>
    </Modal>
  );
};
