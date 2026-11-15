import React from 'react';
import type { FieldErrors } from '@/shared/api/types';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { TextField } from '@/shared/ui/text-field';
import {
  FieldError,
  FieldHint,
  FieldTitle,
  RemoveCell,
  SlotCard,
  SlotGrid,
  SlotHeader,
  StyledSlotsField
} from './styles';

/** Form-state slot: inputs hold strings until the form is submitted. */
export type SlotFormValue = {
  label: string;
  startsAtLocal: string;
  endsAtLocal: string;
  capacity: string;
};

const emptySlot = (): SlotFormValue => ({
  label: '',
  startsAtLocal: '',
  endsAtLocal: '',
  capacity: ''
});

export type SlotsFieldProps = {
  slots: SlotFormValue[];
  onChange: (slots: SlotFormValue[]) => void;
  /** Errors keyed like the API: `slots`, `slots.0.capacity`. */
  errors?: FieldErrors;
  /** Slots can't change once people have registered. */
  locked?: boolean;
  maxSlots?: number;
};

/**
 * Optional time slots (sessions). Each slot has its own seats; the event's
 * start time and capacity come from the slots.
 */
export const SlotsField = ({
  slots,
  onChange,
  errors = {},
  locked = false,
  maxSlots = 10
}: SlotsFieldProps) => {
  const total = slots.reduce(
    (sum, slot) => sum + (Number.parseInt(slot.capacity, 10) || 0),
    0
  );
  const update = (index: number, patch: Partial<SlotFormValue>) =>
    onChange(
      slots.map((slot, i) => (i === index ? { ...slot, ...patch } : slot))
    );
  const error = (index: number, field: keyof SlotFormValue) =>
    errors[`slots.${index}.${field}`];

  return (
    <StyledSlotsField>
      <FieldTitle>Time slots (optional)</FieldTitle>
      <FieldHint>
        {locked
          ? "People have registered, so time slots can't be changed."
          : 'Add sessions if attendees should pick a time. Each slot has its own seats.'}
        {slots.length > 0
          ? ` Total capacity: ${total}. The event starts with the earliest slot.`
          : ''}
      </FieldHint>

      {slots.map((slot, index) => (
        <SlotCard key={index} aria-label={`Time slot ${index + 1}`}>
          <SlotHeader>
            <strong>Slot {index + 1}</strong>
            {locked ? null : (
              <RemoveCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange(slots.filter((_, i) => i !== index))}
                  aria-label={`Remove slot ${index + 1}`}
                >
                  <Icon name="trash" size={16} />
                </Button>
              </RemoveCell>
            )}
          </SlotHeader>
          <SlotGrid>
            <TextField
              label="Slot name"
              placeholder="e.g. Morning batch"
              value={slot.label}
              onChange={(event) => update(index, { label: event.target.value })}
              error={error(index, 'label')}
              maxLength={80}
              disabled={locked}
              required
            />
            <TextField
              label="Seats"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={slot.capacity}
              onChange={(event) =>
                update(index, { capacity: event.target.value })
              }
              error={error(index, 'capacity')}
              disabled={locked}
              required
            />
            <TextField
              label="Starts"
              type="datetime-local"
              value={slot.startsAtLocal}
              onChange={(event) =>
                update(index, { startsAtLocal: event.target.value })
              }
              error={error(index, 'startsAtLocal')}
              disabled={locked}
              required
            />
            <TextField
              label="Ends"
              type="datetime-local"
              value={slot.endsAtLocal}
              min={slot.startsAtLocal || undefined}
              onChange={(event) =>
                update(index, { endsAtLocal: event.target.value })
              }
              error={error(index, 'endsAtLocal')}
              disabled={locked}
              required
            />
          </SlotGrid>
        </SlotCard>
      ))}

      {errors.slots ? (
        <FieldError role="alert">{errors.slots}</FieldError>
      ) : null}

      {!locked && slots.length < maxSlots ? (
        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onChange([...slots, emptySlot()])}
          >
            <Icon name="plus" size={16} /> Add time slot
          </Button>
        </div>
      ) : null}
    </StyledSlotsField>
  );
};
