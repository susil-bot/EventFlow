import styled, { css } from 'styled-components';
import { Design } from '@/shared/styles/tokens';
import { overline } from '@/shared/styles/typography';

export const FieldWrapper = styled.div.withConfig({
  displayName: 'FieldWrapper'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Xxs});
`;

export const FieldLabel = styled.label.withConfig({
  displayName: 'FieldLabel'
})`
  ${overline}
  margin-bottom: var(${Design.Space.Xxs});
  color: var(${Design.Color.Text});
`;

const controlStyles = css<{ $hasError: boolean }>`
  width: 100%;
  min-height: 48px;
  padding: 12px 16px;
  border: 1px solid
    ${({ $hasError }) =>
      $hasError
        ? `var(${Design.Color.Danger})`
        : `var(${Design.Color.BorderStrong})`};
  border-radius: var(${Design.Radius.Control});
  background: var(${Design.Color.Surface});
  color: var(${Design.Color.Text});
  font: inherit;
  font-size: var(${Design.Font.SizeMd});

  &::placeholder {
    color: var(${Design.Color.TextMuted});
  }

  &:focus {
    outline: none;
    box-shadow: inset 0 0 0 1px var(${Design.Color.BorderStrong});
  }

  &:focus-visible {
    outline: 3px solid var(${Design.Color.Focus});
    outline-offset: 2px;
  }

  &:disabled {
    background: var(${Design.Color.SurfaceMuted});
    cursor: not-allowed;
  }
`;

export const StyledInput = styled.input.withConfig({
  displayName: 'TextFieldInput'
})<{ $hasError: boolean }>`
  ${controlStyles}
`;

export const StyledTextarea = styled.textarea.withConfig({
  displayName: 'TextFieldTextarea'
})<{ $hasError: boolean }>`
  ${controlStyles}
  resize: vertical;
`;

export const FieldHint = styled.p.withConfig({ displayName: 'FieldHint' })`
  font-size: var(${Design.Font.SizeXs});
  color: var(${Design.Color.TextMuted});
`;

export const FieldError = styled.p.withConfig({ displayName: 'FieldError' })`
  font-size: var(${Design.Font.SizeXs});
  font-weight: 500;
  color: var(${Design.Color.Danger});
`;

/** Character count, right-aligned under the control. */
export const FieldCount = styled.p.withConfig({ displayName: 'FieldCount' })`
  align-self: flex-end;
  font-size: var(${Design.Font.SizeXs});
  color: var(${Design.Color.TextMuted});
  font-variant-numeric: tabular-nums;
`;
