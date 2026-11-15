import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';

export const StyledDateBadge = styled.span.withConfig({
  displayName: 'DateBadge'
})`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 44px;
  overflow: hidden;
  border: 1px solid var(${Design.Color.Border});
  border-radius: var(${Design.Radius.Md});
  background: var(${Design.Color.Surface});
`;

export const BadgeMonth = styled.span.withConfig({
  displayName: 'DateBadgeMonth'
})`
  width: 100%;
  padding: 1px 0;
  text-align: center;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(${Design.Color.TextMuted});
  background: var(${Design.Color.SurfaceMuted});
`;

export const BadgeDay = styled.span.withConfig({
  displayName: 'DateBadgeDay'
})`
  padding: 2px 0 4px;
  font-size: var(${Design.Font.SizeLg});
  font-weight: 600;
  line-height: 1.2;
`;
