import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';

export const NameCell = styled.span.withConfig({
  displayName: 'AdminUserNameCell'
})`
  display: flex;
  flex-direction: column;
  min-width: 200px;

  span {
    font-size: var(${Design.Font.SizeXs});
    color: var(${Design.Color.TextMuted});
  }
`;

export const Actions = styled.div.withConfig({
  displayName: 'AdminUserActions'
})`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(${Design.Space.Xs});
`;

export const Muted = styled.span.withConfig({
  displayName: 'AdminUserMuted'
})`
  font-size: var(${Design.Font.SizeXs});
  color: var(${Design.Color.TextMuted});
`;
