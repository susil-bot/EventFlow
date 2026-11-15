import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';
import { overline } from '@/shared/styles/typography';

export const StyledPanel = styled.section.withConfig({
  displayName: 'RegistrationPanel'
})`
  overflow: hidden;
  border: 1px solid var(${Design.Color.Border});
  border-radius: var(${Design.Radius.Lg});
  background: var(${Design.Color.Surface});
  box-shadow: var(${Design.Shadow.Card});
`;

export const PanelHeader = styled.h2.withConfig({
  displayName: 'RegistrationPanelHeader'
})`
  padding: var(${Design.Space.Xs}) var(${Design.Space.Md});
  ${overline}
  color: var(${Design.Color.TextMuted});
  background: var(${Design.Color.SurfaceMuted});
  border-bottom: 1px solid var(${Design.Color.Border});
`;

export const PanelBody = styled.div.withConfig({
  displayName: 'RegistrationPanelBody'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Md});
  padding: var(${Design.Space.Md});
`;

export const PanelMessage = styled.p.withConfig({
  displayName: 'RegistrationPanelMessage'
})`
  color: var(${Design.Color.Text});
`;

export const PanelIdentity = styled.p.withConfig({
  displayName: 'RegistrationPanelIdentity'
})`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(${Design.Space.Xs});
  font-size: var(${Design.Font.SizeSm});

  span {
    color: var(${Design.Color.TextMuted});
  }
`;

export const PanelConfirm = styled.div.withConfig({
  displayName: 'RegistrationPanelConfirm'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Sm});
  font-size: var(${Design.Font.SizeSm});
`;

export const SlotChoices = styled.fieldset.withConfig({
  displayName: 'RegistrationPanelSlotChoices'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Xs});
  margin: 0;
  padding: 0;
  border: 0;

  legend {
    margin-bottom: var(${Design.Space.Xs});
    font-size: var(${Design.Font.SizeSm});
    font-weight: 600;
  }
`;

export const SlotChoice = styled.label.withConfig({
  displayName: 'RegistrationPanelSlotChoice'
})<{ $disabled: boolean }>`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(${Design.Space.Sm});
  padding: var(${Design.Space.Sm});
  border: 1px solid var(${Design.Color.Border});
  border-radius: var(${Design.Radius.Md});
  font-size: var(${Design.Font.SizeSm});
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};

  &:has(input:checked) {
    border-color: var(${Design.Color.Accent});
    background: var(${Design.Color.InfoSurface});
  }

  small {
    color: var(${Design.Color.TextMuted});
    font-weight: 600;
  }
`;
