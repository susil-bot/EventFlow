import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';

export const CheckboxLabel = styled.label.withConfig({
  displayName: 'CheckboxLabel'
})`
  display: inline-flex;
  align-items: center;
  gap: var(${Design.Space.Sm});
  min-height: 48px;
  color: var(${Design.Color.Text});
  font-size: var(${Design.Font.SizeMd});
  cursor: pointer;
`;

export const CheckboxInput = styled.input.withConfig({
  displayName: 'CheckboxInput'
})`
  appearance: none;
  display: inline-grid;
  place-content: center;
  flex: none;
  width: 20px;
  height: 20px;
  margin: 0;
  border: 1px solid var(${Design.Color.BorderStrong});
  border-radius: var(${Design.Radius.Control});
  background: var(${Design.Color.Surface});
  cursor: pointer;

  &::after {
    content: '';
    width: 10px;
    height: 10px;
    background: var(${Design.Color.Primary});
    transform: scale(0);
    transition: transform 100ms ease;
  }

  &:checked::after {
    transform: scale(1);
  }

  &:focus-visible {
    outline: 2px solid var(${Design.Color.Focus});
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;
