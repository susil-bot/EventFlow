import React, { useId } from 'react';
import { BasicsSection } from './sections/BasicsSection';
import { FormButtons } from './sections/FormButtons';
import { ImagesSection, LinksSection } from './sections/MediaSections';
import { DateTimeSection } from './sections/DateTimeSection';
import { LocationSection } from './sections/LocationSection';
import {
  EditorActionsSlot,
  EditorHeaderSlot,
  EditorLayout,
  StyledForm
} from './styles';
import type { EventFormProps } from './types';
import { useEventForm } from './use-event-form';

export type {
  EventFormActionState,
  EventFormInitialValues,
  EventFormIntent,
  EventFormProps
} from './types';

/**
 * Create / edit form for an event. State and validation live in
 * `useEventForm`; each section under `sections/` renders one part. Pages
 * can put a header above it and their own action bar beside it
 * (`header`, `renderActions`); the action bar stays in view while the
 * form scrolls.
 */
export const EventForm = ({
  mode,
  initialValues,
  minCapacity = 0,
  serverErrors,
  cities = [],
  submittingIntent,
  onSubmit,
  onUploadImage,
  onCancel,
  onDirtyChange,
  formId: formIdProp,
  header,
  renderActions
}: EventFormProps) => {
  const generatedId = useId();
  const formId = formIdProp ?? `event-form-${generatedId}`;
  const form = useEventForm({
    mode,
    initialValues,
    minCapacity,
    serverErrors,
    onSubmit,
    onDirtyChange
  });
  const sectionProps = {
    values: form.values,
    errors: form.errors,
    onText: form.onText,
    setField: form.setField
  };

  return (
    <EditorLayout>
      {header ? <EditorHeaderSlot>{header}</EditorHeaderSlot> : null}
      {renderActions ? (
        <EditorActionsSlot>
          {renderActions({
            isDirty: form.isDirty,
            isScheduling: form.values.scheduleGoLive,
            values: form.values,
            submit: form.submitWith
          })}
        </EditorActionsSlot>
      ) : null}
      <StyledForm
        id={formId}
        onSubmit={form.handleSubmit}
        noValidate
        aria-label="Event details"
      >
        <BasicsSection {...sectionProps} onSlugChange={form.onSlugChange} />
        <DateTimeSection
          {...sectionProps}
          slotsLocked={mode === 'edit' && minCapacity > 0}
        />
        <LocationSection
          {...sectionProps}
          minCapacity={minCapacity}
          cities={cities}
        />
        {onUploadImage ? (
          <ImagesSection {...sectionProps} onUpload={onUploadImage} />
        ) : null}
        <LinksSection {...sectionProps} />
        {renderActions ? null : (
          <FormButtons
            mode={mode}
            isScheduling={form.values.scheduleGoLive}
            onCancel={onCancel}
            submittingIntent={submittingIntent}
          />
        )}
      </StyledForm>
    </EditorLayout>
  );
};
