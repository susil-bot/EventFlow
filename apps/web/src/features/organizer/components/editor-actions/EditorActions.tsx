import React from 'react';
import type { EventPhase } from '@/shared/api/types';
import { ActionMenu, type ActionMenuItem } from '@/shared/ui/action-menu';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import type { EventFormIntent } from '../event-form';
import { ExitButton, PreviewLink, StyledEditorActions } from './styles';

export type EditorActionsProps = {
  /** The `<form id>` these buttons submit (they sit outside the form). */
  formId: string;
  mode: 'create' | 'edit';
  /** Phase of the saved event; drafts offer Publish. */
  phase?: EventPhase;
  /** The form differs from what is saved. */
  isDirty: boolean;
  /** A go-live time is set, so publishing schedules the event. */
  isScheduling: boolean;
  submittingIntent?: EventFormIntent;
  /** The public event page; Preview is disabled until the event is saved. */
  previewHref?: string;
  /** Secondary actions in the "···" menu (unpublish, cancel…). */
  menuItems?: ActionMenuItem[];
  /** Opens the Publish dialog (publishing is never a single click). */
  onPublish: () => void;
  /** The Publish dialog is submitting. */
  isPublishing?: boolean;
  onExit: () => void;
};

/**
 * The editor's floating action bar: more actions, Preview, Save, Publish
 * and Close. On phones it is one row docked to the bottom: Preview shrinks
 * to its icon and Save/Publish share the remaining width. Save stays disabled until something changes and submits the
 * form with its intent. Publish opens a confirmation dialog instead of
 * publishing straight away.
 */
export const EditorActions = ({
  formId,
  mode,
  phase,
  isDirty,
  isScheduling,
  submittingIntent,
  previewHref,
  menuItems = [],
  onPublish,
  isPublishing = false,
  onExit
}: EditorActionsProps) => {
  const isSubmitting = submittingIntent !== undefined || isPublishing;
  const isDraft = mode === 'create' || phase === 'DRAFT';
  const submit = (
    intent: EventFormIntent,
    label: string,
    options: { variant?: 'secondary'; disabled?: boolean } = {}
  ) => (
    <Button
      type="submit"
      form={formId}
      name="intent"
      value={intent}
      variant={options.variant}
      className="grow"
      isLoading={submittingIntent === intent}
      disabled={isSubmitting || options.disabled}
    >
      {label}
    </Button>
  );

  return (
    <StyledEditorActions role="toolbar" aria-label="Event actions">
      <ActionMenu label="More actions" items={menuItems} />
      {previewHref ? (
        <PreviewLink href={previewHref} target="_blank" rel="noopener">
          <Icon name="eye" size={18} />
          <span className="action-label">Preview</span>
          <span className="visually-hidden"> (opens in a new tab)</span>
        </PreviewLink>
      ) : (
        <Button
          variant="secondary"
          disabled
          title="Save the event to preview it"
          className="icon-on-phone"
        >
          <Icon name="eye" size={18} />
          <span className="action-label">Preview</span>
        </Button>
      )}
      {isDraft ? (
        <>
          {submit(mode === 'create' ? 'draft' : 'save', 'Save', {
            variant: 'secondary',
            disabled: mode === 'edit' && !isDirty
          })}
          <Button
            onClick={onPublish}
            isLoading={isPublishing || submittingIntent === 'publish'}
            disabled={isSubmitting}
            aria-haspopup="dialog"
            className="grow"
          >
            {isScheduling ? 'Schedule…' : 'Publish…'}
          </Button>
        </>
      ) : (
        submit('save', 'Save changes', { disabled: !isDirty })
      )}
      <ExitButton type="button" aria-label="Close editor" onClick={onExit}>
        <Icon name="exit" size={24} />
      </ExitButton>
    </StyledEditorActions>
  );
};
