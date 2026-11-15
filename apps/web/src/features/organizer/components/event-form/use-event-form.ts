import { type FormEvent, useEffect, useState } from 'react';
import type { FieldErrors } from '@/shared/api/types';
import { slugify } from '@/features/events/utils/event-format';
import { getIntent, toFormValues } from './form-values';
import type {
  EventFormIntent,
  EventFormProps,
  SectionProps,
  TextFieldName
} from './types';
import {
  type EventFormValues,
  toEventInput,
  validateEventForm
} from './validation';

type UseEventFormOptions = Pick<
  EventFormProps,
  | 'mode'
  | 'initialValues'
  | 'minCapacity'
  | 'serverErrors'
  | 'onSubmit'
  | 'onDirtyChange'
>;

/**
 * Form state for `EventForm`: values, client-side validation, the
 * title → URL slug link and submission. Keeps the component purely
 * presentational.
 */
export const useEventForm = ({
  mode,
  initialValues,
  minCapacity = 0,
  serverErrors = {},
  onSubmit,
  onDirtyChange
}: UseEventFormOptions) => {
  const [initial] = useState(() => toFormValues(initialValues));
  const [values, setValues] = useState(initial);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  // In create mode the URL follows the title until the organizer edits it.
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');

  const errors: FieldErrors = { ...serverErrors, ...clientErrors };
  // Anything changed since the form opened (drives Save and, through
  // `onDirtyChange`, the page's leave guard).
  const isDirty = JSON.stringify(values) !== JSON.stringify(initial);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Unmounting (e.g. reloaded after a save) leaves nothing unsaved behind.
  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

  const clearErrors = (prefix: string) =>
    setClientErrors((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([key]) => !key.startsWith(prefix))
      )
    );

  const setField: SectionProps['setField'] = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    clearErrors(field);
  };

  const onText =
    (field: TextFieldName) => (event: { target: { value: string } }) => {
      const { value } = event.target;
      setValues((current) => ({
        ...current,
        [field]: value,
        ...(field === 'title' && !slugTouched ? { slug: slugify(value) } : {})
      }));
      clearErrors(field);
    };

  const onSlugChange = (value: string) => {
    setSlugTouched(true);
    setField('slug', slugify(value));
  };

  /**
   * Validates and submits with the given intent, optionally changing some
   * values first (e.g. the go-live time chosen in the Publish dialog).
   * Returns false when validation failed, so a dialog can stay open.
   */
  const submitWith = (
    intent: EventFormIntent,
    overrides: Partial<EventFormValues> = {}
  ): boolean => {
    const next = { ...values, ...overrides };
    if (Object.keys(overrides).length > 0) {
      setValues(next);
    }
    const nextErrors = validateEventForm(next, minCapacity, {
      publishing: intent === 'publish'
    });
    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return false;
    }
    onSubmit(buildPayload(next, initial, mode), intent);
    return true;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitWith(getIntent(event, mode));
  };

  return {
    values,
    errors,
    isDirty,
    setField,
    onText,
    onSlugChange,
    handleSubmit,
    submitWith
  };
};

/**
 * In edit mode unchanged slots are left out of the payload, so the other
 * fields stay editable after people have registered (slots then lock).
 * An unchanged map pin is left out too, so older published events without
 * one can still be edited.
 */
const buildPayload = (
  values: EventFormValues,
  initial: EventFormValues,
  mode: EventFormProps['mode']
) => {
  const input = toEventInput(values);
  if (mode !== 'edit') {
    return input;
  }
  const slotsUnchanged =
    JSON.stringify(values.slots) === JSON.stringify(initial.slots) &&
    values.timeZone === initial.timeZone;
  const pinUnchanged =
    JSON.stringify(values.venueLocation) ===
      JSON.stringify(initial.venueLocation) &&
    values.eventType === initial.eventType;
  const { slots, venueLocation, ...rest } = input;
  return {
    ...rest,
    ...(slotsUnchanged ? {} : { slots }),
    ...(pinUnchanged ? {} : { venueLocation })
  };
};
