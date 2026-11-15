import styled, { css } from 'styled-components';
import { Design } from '@/shared/styles/tokens';
import { displayHeading } from '@/shared/styles/typography';

const linkButton = css`
  padding: 0;
  border: 0;
  background: transparent;
  color: var(${Design.Color.Accent});
  font: inherit;
  cursor: pointer;

  &:hover:not(:disabled) {
    text-decoration: underline;
  }
`;

export const StyledPanel = styled.section.withConfig({
  displayName: 'FilterPanel'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Sm});
`;

export const PanelHeader = styled.div.withConfig({
  displayName: 'FilterPanelHeader'
})`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(${Design.Space.Sm});
  margin-bottom: var(${Design.Space.Sm});
`;

export const PanelTitle = styled.h2.withConfig({
  displayName: 'FilterPanelTitle'
})`
  ${displayHeading}
  font-size: var(${Design.Font.SizeXxl});
`;

export const ClearAllButton = styled.button.withConfig({
  displayName: 'FilterPanelClearAll'
})`
  ${linkButton}
  font-size: var(${Design.Font.SizeSm});
`;

export const StyledSection = styled.div.withConfig({
  displayName: 'FilterSection'
})`
  border: 1px solid var(${Design.Color.Border});
  background: var(${Design.Color.Surface});
`;

export const SectionHeader = styled.div.withConfig({
  displayName: 'FilterSectionHeader'
})`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(${Design.Space.Md}) 0 0;
`;

export const SectionToggle = styled.button.withConfig({
  displayName: 'FilterSectionToggle'
})<{ $active: boolean }>`
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(${Design.Space.Sm});
  min-height: 56px;
  padding: 0 var(${Design.Space.Md});
  border: 0;
  background: transparent;
  color: ${({ $active }) =>
    $active ? `var(${Design.Color.Accent})` : `var(${Design.Color.Text})`};
  font: inherit;
  font-size: var(${Design.Font.SizeMd});
  font-weight: 500;
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(${Design.Color.Focus});
    outline-offset: -2px;
  }
`;

export const ClearButton = styled.button.withConfig({
  displayName: 'FilterSectionClear'
})`
  ${linkButton}
  font-size: var(${Design.Font.SizeSm});

  &:disabled {
    color: var(${Design.Color.TextMuted});
    cursor: default;
  }
`;

export const SectionBody = styled.div.withConfig({
  displayName: 'FilterSectionBody'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Sm});
  padding: 0 var(${Design.Space.Md}) var(${Design.Space.Md});

  &[hidden] {
    display: none;
  }
`;

export const ChipList = styled.ul.withConfig({
  displayName: 'FilterChipList'
})`
  display: flex;
  flex-wrap: wrap;
  gap: var(${Design.Space.Xs});
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const SectionNote = styled.p.withConfig({
  displayName: 'FilterSectionNote'
})`
  color: var(${Design.Color.TextMuted});
  font-size: var(${Design.Font.SizeSm});
`;

export const TextButton = styled.button.withConfig({
  displayName: 'FilterTextButton'
})`
  ${linkButton}
`;
