import React, { type InputHTMLAttributes, useId } from 'react';
import { CheckboxInput, CheckboxLabel } from './styles';

export type CheckboxProps = {
  label: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/** Square, outlined checkbox matching the form controls. */
export const Checkbox = ({ label, id: idProp, ...rest }: CheckboxProps) => {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  return (
    <CheckboxLabel htmlFor={id}>
      <CheckboxInput id={id} type="checkbox" {...rest} />
      {label}
    </CheckboxLabel>
  );
};
