import React from 'react';
import {
  EVENT_CATEGORIES,
  EVENT_TYPES,
  type EventType
} from '@/shared/api/types';
import {
  CATEGORY_LABEL,
  EVENT_TYPE_LABEL
} from '@/features/events/utils/event-format';
import { SelectField } from '@/shared/ui/select-field';
import { TextField } from '@/shared/ui/text-field';
import { FormGrid, FormSection, FormSectionTitle } from '../styles';
import type { SectionProps } from '../types';

const TYPE_OPTIONS = EVENT_TYPES.map((type) => ({
  value: type,
  label: EVENT_TYPE_LABEL[type]
}));

const CATEGORY_OPTIONS = [
  { value: '', label: 'Choose a category' },
  ...EVENT_CATEGORIES.map((category) => ({
    value: category,
    label: CATEGORY_LABEL[category]
  }))
];

type BasicsSectionProps = SectionProps & {
  onSlugChange: (value: string) => void;
};

/** Title, description, type, category and the event URL. */
export const BasicsSection = ({
  values,
  errors,
  onText,
  setField,
  onSlugChange
}: BasicsSectionProps) => (
  <FormSection>
    <FormSectionTitle>Basics</FormSectionTitle>
    <TextField
      label="Title"
      value={values.title}
      onChange={onText('title')}
      error={errors.title}
      maxLength={150}
      showCount
      required
    />
    <TextField
      label="Description"
      multiline
      value={values.description}
      onChange={onText('description')}
      error={errors.description}
      maxLength={5000}
      showCount
      required
    />
    <FormGrid>
      <SelectField
        label="Event type"
        options={TYPE_OPTIONS}
        value={values.eventType}
        onChange={(event) =>
          setField('eventType', event.target.value as EventType)
        }
        error={errors.eventType}
        required
      />
      <SelectField
        label="Category"
        options={CATEGORY_OPTIONS}
        value={values.category}
        onChange={onText('category')}
        error={errors.category}
        required
      />
    </FormGrid>
    <TextField
      label="Event URL"
      value={values.slug}
      onChange={(event) => onSlugChange(event.target.value)}
      error={errors.slug}
      hint={
        values.slug
          ? `Your event page: /events/${values.slug}`
          : 'Filled in from the title. Lowercase letters, numbers and hyphens.'
      }
      maxLength={80}
    />
  </FormSection>
);
