import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';

export const StyledStatCard = styled.div.withConfig({
  displayName: 'StatCard'
})`
  display: flex;
  align-items: center;
  gap: var(${Design.Space.Md});
  padding: var(${Design.Space.Md}) var(${Design.Space.Lg});
  border-radius: var(${Design.Radius.Xl});
  background: var(${Design.Color.Surface});
`;

export const StatIcon = styled.span.withConfig({
  displayName: 'StatCardIcon'
})`
  display: inline-flex;
  padding: var(${Design.Space.Sm});
  border-radius: var(${Design.Radius.Lg});
  color: var(${Design.Color.Accent});
  background: var(${Design.Color.SurfaceMuted});
`;

export const StatValue = styled.p.withConfig({
  displayName: 'StatCardValue'
})`
  font-size: var(${Design.Font.SizeXl});
  font-weight: 700;
  line-height: 1.2;
`;

export const StatLabel = styled.p.withConfig({
  displayName: 'StatCardLabel'
})`
  font-size: var(${Design.Font.SizeSm});
  color: var(${Design.Color.TextMuted});
`;
