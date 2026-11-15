import React, {
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  useId
} from 'react';
import {
  FieldCount,
  FieldError,
  FieldHint,
  FieldLabel,
  FieldWrapper,
  StyledInput,
  StyledTextarea
} from './styles';

type BaseProps = {
  label: string;
  error?: string;
  hint?: string;
  /** Show "41 / 150 chars" under the field (needs `maxLength`). */
  showCount?: boolean;
};

type InputProps = BaseProps & {
  multiline?: false;
} & InputHTMLAttributes<HTMLInputElement>;

type TextareaProps = BaseProps & {
  multiline: true;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export type TextFieldProps = InputProps | TextareaProps;

/** Labelled input or textarea with hint and error wiring for a11y. */
export const TextField = (props: TextFieldProps) => {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [props.hint ? hintId : '', props.error ? errorId : '']
      .filter(Boolean)
      .join(' ') || undefined;

  const a11y = {
    id,
    'aria-invalid': props.error ? true : undefined,
    'aria-describedby': describedBy,
    $hasError: Boolean(props.error)
  };

  const renderControl = () => {
    if (props.multiline) {
      const {
        label: _l,
        error: _e,
        hint: _h,
        multiline: _m,
        showCount: _c,
        ...rest
      } = props;
      return <StyledTextarea rows={5} {...rest} {...a11y} />;
    }
    const {
      label: _l,
      error: _e,
      hint: _h,
      multiline: _m,
      showCount: _c,
      ...rest
    } = props;
    return <StyledInput {...rest} {...a11y} />;
  };

  return (
    <FieldWrapper>
      <FieldLabel htmlFor={id}>
        {props.label}
        {props.required ? <span aria-hidden="true"> *</span> : null}
      </FieldLabel>
      {renderControl()}
      {props.showCount && props.maxLength ? (
        <FieldCount>
          {String(props.value ?? '').length} / {props.maxLength} chars
        </FieldCount>
      ) : null}
      {props.hint ? <FieldHint id={hintId}>{props.hint}</FieldHint> : null}
      {props.error ? <FieldError id={errorId}>{props.error}</FieldError> : null}
    </FieldWrapper>
  );
};
