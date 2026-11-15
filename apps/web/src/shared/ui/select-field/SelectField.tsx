import React, { useId } from 'react';
import { Select, type SelectChange, type SelectOption } from '../select';
import {
  FieldError,
  FieldHint,
  FieldLabel,
  FieldWrapper
} from '../text-field/styles';

export type { SelectOption };

export type SelectFieldProps = {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (event: SelectChange) => void;
  error?: string;
  hint?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
};

/** Labelled dropdown with hint and error text (see `Select`). */
export const SelectField = ({
  label,
  options,
  value,
  onChange,
  error,
  hint,
  id: idProp,
  name,
  required,
  disabled
}: SelectFieldProps) => {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hint ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ') ||
    undefined;

  return (
    <FieldWrapper>
      <FieldLabel htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </FieldLabel>
      <Select
        id={id}
        name={name}
        options={options}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        hasError={Boolean(error)}
        aria-describedby={describedBy}
      />
      {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </FieldWrapper>
  );
};
