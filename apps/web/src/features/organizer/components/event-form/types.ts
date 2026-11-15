import type {
  City,
  EventDto,
  EventImage,
  EventInput,
  FieldErrors
} from '@/shared/api/types';
import type { ReactNode } from 'react';
import type { EventFormValues } from './validation';

export type EventFormIntent = 'draft' | 'publish' | 'save';

/** Values an existing event can prefill the form with. */
export type EventFormInitialValues = Partial<
  Pick<
    EventDto,
    | 'title'
    | 'description'
    | 'eventType'
    | 'category'
    | 'slug'
    | 'startsAtLocal'
    | 'timeZone'
    | 'venue'
    | 'city'
    | 'venueLocation'
    | 'price'
    | 'onlineUrl'
    | 'capacity'
    | 'socialLinks'
    | 'images'
    | 'phase'
    | 'publishAtLocal'
    | 'expiresAtLocal'
  > & {
    slots: Pick<
      EventDto['slots'][number],
      'label' | 'startsAtLocal' | 'endsAtLocal' | 'capacity'
    >[];
  }
>;

export type EventFormProps = {
  mode: 'create' | 'edit';
  initialValues?: EventFormInitialValues;
  /** Active registrations; capacity cannot go below this. */
  minCapacity?: number;
  serverErrors?: FieldErrors;
  /** Cities an in-person or hybrid event can take place in. */
  cities?: City[];
  /** Which intent is currently submitting, to show a spinner on that button. */
  submittingIntent?: EventFormIntent;
  /**
   * Receives the form as an API payload. In edit mode `slots` is left out
   * when unchanged, so other fields stay editable after people register.
   */
  onSubmit: (input: EventInput, intent: EventFormIntent) => void;
  /** Uploads a promo image; the image section is hidden without it. */
  onUploadImage?: (file: File) => Promise<EventImage>;
  onCancel?: () => void;
  /**
   * Called when the form starts or stops differing from what it was opened
   * with, so the page can guard navigation (`useLeaveGuard`).
   */
  onDirtyChange?: (isDirty: boolean) => void;
  /** `id` of the `<form>`, so buttons outside it can submit it. */
  formId?: string;
  /** Rendered above the form, e.g. the editor header. */
  header?: ReactNode;
  /**
   * Replaces the built-in buttons with a custom action bar (submit buttons
   * pointing at `formId`), given the form's current state.
   */
  renderActions?: (state: EventFormActionState) => ReactNode;
};

export type EventFormActionState = {
  /** The form differs from what it was opened with. */
  isDirty: boolean;
  /** A go-live time is set, so publishing schedules the event. */
  isScheduling: boolean;
  /** Current values (read-only), e.g. for the Publish dialog. */
  values: EventFormValues;
  /**
   * Validates and submits with an intent, after applying `overrides`.
   * Returns false if the form has errors (they are shown on the fields).
   */
  submit: (
    intent: EventFormIntent,
    overrides?: Partial<EventFormValues>
  ) => boolean;
};

/** Text-like inputs that share the generic change handler. */
export type TextFieldName =
  | 'title'
  | 'description'
  | 'startsAtLocal'
  | 'timeZone'
  | 'venue'
  | 'onlineUrl'
  | 'capacity'
  | 'price'
  | 'publishAtLocal'
  | 'expiresAtLocal'
  | 'category';

/** Props every form section receives from `useEventForm`. */
export type SectionProps = {
  values: EventFormValues;
  errors: FieldErrors;
  /** Change handler for a text-like input. */
  onText: (
    field: TextFieldName
  ) => (event: { target: { value: string } }) => void;
  /** Sets any field directly (selects, lists, uploads). */
  setField: <K extends keyof EventFormValues>(
    field: K,
    value: EventFormValues[K]
  ) => void;
};
