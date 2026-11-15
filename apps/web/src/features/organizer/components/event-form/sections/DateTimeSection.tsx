import React, { useMemo } from 'react';
import { getTimeZones } from '@/shared/utils/time-zones';
import { SelectField } from '@/shared/ui/select-field';
import { TextField } from '@/shared/ui/text-field';
import { type SlotFormValue, SlotsField } from '../../slots-field';
import {
  describeListingWindow,
  SCHEDULE_MESSAGES,
  startHasPassed
} from '../schedule';
import {
  FormGrid,
  FormSection,
  FormSectionTitle,
  FormSubsectionTitle,
  FieldStack,
  SectionNote
} from '../styles';
import type { SectionProps } from '../types';

type DateTimeSectionProps = SectionProps & {
  /** Slots can't change once people have registered (the API enforces it). */
  slotsLocked: boolean;
};

const GO_LIVE_OPTIONS = [
  { value: 'publish', label: 'When you publish' },
  { value: 'scheduled', label: 'At a set time' }
];
const GO_LIVE_LOCKED_OPTIONS = [{ value: 'locked', label: 'Already live' }];
const LISTING_END_OPTIONS = [
  { value: 'start', label: 'When the event starts' },
  { value: 'early', label: 'At an earlier time' }
];

/**
 * Everything about time in one place: when the event happens (a start
 * time or time slots), its time zone, and when it is listed in Discover
 * (go-live and listing end). One summary line states the whole window and
 * the time zone, instead of repeating the zone on every field.
 */
export const DateTimeSection = ({
  values,
  errors,
  onText,
  setField,
  slotsLocked
}: DateTimeSectionProps) => {
  const { timeZone } = values;
  const hasSlots = values.slots.length > 0;
  let goLiveMode = values.scheduleGoLive ? 'scheduled' : 'publish';
  if (values.goLiveLocked) {
    goLiveMode = 'locked';
  }
  const timeZoneOptions = useMemo(
    () =>
      getTimeZones([timeZone]).map((zone) => ({ value: zone, label: zone })),
    [timeZone]
  );

  return (
    <FormSection>
      <FormSectionTitle>Date & time</FormSectionTitle>
      <FormGrid>
        {hasSlots ? null : (
          <TextField
            label="Start date and time"
            type="datetime-local"
            value={values.startsAtLocal}
            onChange={onText('startsAtLocal')}
            error={errors.startsAtLocal}
            hint={
              !values.isPublished && startHasPassed(values)
                ? SCHEDULE_MESSAGES.startPassedDraftHint
                : undefined
            }
            required
          />
        )}
        <SelectField
          label="Time zone"
          options={timeZoneOptions}
          value={timeZone}
          onChange={onText('timeZone')}
          error={errors.timeZone}
          required
        />
      </FormGrid>
      <SlotsField
        slots={values.slots}
        onChange={(slots: SlotFormValue[]) => setField('slots', slots)}
        errors={errors}
        locked={slotsLocked}
      />

      <FormSubsectionTitle>Listing in Discover</FormSubsectionTitle>
      <FormGrid>
        <FieldStack>
          <SelectField
            label="Goes live"
            options={
              values.goLiveLocked ? GO_LIVE_LOCKED_OPTIONS : GO_LIVE_OPTIONS
            }
            value={goLiveMode}
            onChange={(event) =>
              setField('scheduleGoLive', event.target.value === 'scheduled')
            }
            disabled={values.goLiveLocked}
            hint={
              values.goLiveLocked
                ? 'Unpublish the event to change this.'
                : undefined
            }
          />
          {values.scheduleGoLive && !values.goLiveLocked ? (
            <TextField
              label="Go-live date and time"
              type="datetime-local"
              value={values.publishAtLocal}
              onChange={onText('publishAtLocal')}
              error={errors.publishAtLocal}
              required
            />
          ) : null}
        </FieldStack>
        <FieldStack>
          <SelectField
            label="Listing ends"
            options={LISTING_END_OPTIONS}
            value={values.endListingEarly ? 'early' : 'start'}
            onChange={(event) =>
              setField('endListingEarly', event.target.value === 'early')
            }
          />
          {values.endListingEarly ? (
            <TextField
              label="Listing end date and time"
              type="datetime-local"
              value={values.expiresAtLocal}
              onChange={onText('expiresAtLocal')}
              error={errors.expiresAtLocal}
              required
            />
          ) : null}
        </FieldStack>
      </FormGrid>
      <SectionNote>{describeListingWindow(values)}</SectionNote>
    </FormSection>
  );
};
