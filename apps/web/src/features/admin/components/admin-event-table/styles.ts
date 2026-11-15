import { Link } from 'react-router';
import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';

export const TitleCell = styled.span.withConfig({
  displayName: 'AdminEventTitleCell'
})`
  display: flex;
  flex-direction: column;
  min-width: 220px;

  time {
    font-size: var(${Design.Font.SizeXs});
    color: var(${Design.Color.TextMuted});
  }
`;

export const TitleLink = styled(Link).withConfig({
  displayName: 'AdminEventTitleLink'
})`
  font-weight: 600;
  color: var(${Design.Color.Text}) !important;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const Reason = styled.span.withConfig({
  displayName: 'AdminEventReason'
})`
  font-size: var(${Design.Font.SizeXs});
  color: var(${Design.Color.TextMuted});
`;

export const Actions = styled.div.withConfig({
  displayName: 'AdminEventActions'
})`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(${Design.Space.Xs});
`;
