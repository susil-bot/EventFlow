import styled from 'styled-components';
import { BREAKPOINTS, Design } from '@/shared/styles/tokens';

export const StyledSlotsField = styled.div.withConfig({
  displayName: 'SlotsField'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Sm});
`;

export const FieldTitle = styled.span.withConfig({
  displayName: 'SlotsFieldTitle'
})`
  font-size: var(${Design.Font.SizeSm});
  font-weight: 600;
`;

export const FieldHint = styled.p.withConfig({
  displayName: 'SlotsFieldHint'
})`
  font-size: var(${Design.Font.SizeSm});
  color: var(${Design.Color.TextMuted});
`;

export const FieldError = styled.p.withConfig({
  displayName: 'SlotsFieldError'
})`
  font-size: var(${Design.Font.SizeSm});
  color: var(${Design.Color.Danger});
`;

export const SlotCard = styled.section.withConfig({
  displayName: 'SlotsFieldCard'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Xs});
  padding: var(${Design.Space.Md});
  border: 1px solid var(${Design.Color.Border});
  border-radius: var(${Design.Radius.Md});
  background: var(${Design.Color.SurfaceMuted});
`;

export const SlotHeader = styled.div.withConfig({
  displayName: 'SlotsFieldHeader'
})`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(${Design.Font.SizeSm});
`;

export const SlotGrid = styled.div.withConfig({
  displayName: 'SlotsFieldGrid'
})`
  display: grid;
  gap: var(${Design.Space.Sm});

  @media (min-width: ${BREAKPOINTS.sm}) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const RemoveCell = styled.div.withConfig({
  displayName: 'SlotsFieldRemove'
})`
  margin-left: auto;
`;
