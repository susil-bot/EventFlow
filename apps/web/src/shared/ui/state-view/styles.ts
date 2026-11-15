import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';

export const StatePanel = styled.div.withConfig({
  displayName: 'StatePanel'
})`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(${Design.Space.Sm});
  min-height: 280px;
  padding: var(${Design.Space.Xl});
  border-radius: var(${Design.Radius.Xl});
  background: var(${Design.Color.Surface});
  text-align: center;
  color: var(${Design.Color.TextMuted});
`;

export const StateIcon = styled.span.withConfig({
  displayName: 'StateIcon'
})<{ $tone: 'danger' | 'neutral' }>`
  display: inline-flex;
  padding: var(${Design.Space.Sm});
  border-radius: 50%;
  color: var(
    ${({ $tone }) => ($tone === 'danger' ? Design.Color.Danger : Design.Color.Accent)}
  );
  background: var(
    ${({ $tone }) =>
      $tone === 'danger'
        ? Design.Color.DangerSurface
        : Design.Color.SurfaceMuted}
  );
`;

export const StateTitle = styled.h2.withConfig({ displayName: 'StateTitle' })`
  font-size: var(${Design.Font.SizeXl});
  color: var(${Design.Color.Text});
`;

export const StateMessage = styled.p.withConfig({
  displayName: 'StateMessage'
})`
  max-width: 420px;
  font-size: var(${Design.Font.SizeSm});
`;
