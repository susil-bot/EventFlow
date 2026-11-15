import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';

export const StyledRow = styled.div.withConfig({
  displayName: 'EventMetaRow'
})`
  display: flex;
  align-items: center;
  gap: var(${Design.Space.Md});
`;

export const IconTile = styled.span.withConfig({
  displayName: 'EventMetaRowIconTile'
})`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border: 1px solid var(${Design.Color.Border});
  border-radius: var(${Design.Radius.Md});
  color: var(${Design.Color.TextMuted});
  background: var(${Design.Color.Surface});
`;

export const MetaText = styled.div.withConfig({
  displayName: 'EventMetaRowText'
})`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const MetaPrimary = styled.span.withConfig({
  displayName: 'EventMetaRowPrimary'
})`
  font-weight: 600;
  color: var(${Design.Color.Text});
`;

export const MetaSecondary = styled.span.withConfig({
  displayName: 'EventMetaRowSecondary'
})`
  font-size: var(${Design.Font.SizeSm});
  color: var(${Design.Color.TextMuted});
`;
