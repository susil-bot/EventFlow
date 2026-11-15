import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';

export const ReasonForm = styled.form.withConfig({
  displayName: 'ReasonForm'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Xs});
  min-width: 220px;
`;

export const ReasonFormActions = styled.div.withConfig({
  displayName: 'ReasonFormActions'
})`
  display: flex;
  gap: var(${Design.Space.Xs});
`;
