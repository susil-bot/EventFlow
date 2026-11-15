import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';
import { overline } from '@/shared/styles/typography';

export const StyledResultsBar = styled.div.withConfig({
  displayName: 'ResultsBar'
})`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(${Design.Space.Md});
  margin-bottom: var(${Design.Space.Lg});
`;

export const Summary = styled.p.withConfig({
  displayName: 'ResultsBarSummary'
})`
  ${overline}
`;

export const SortControl = styled.div.withConfig({
  displayName: 'ResultsBarSort'
})`
  display: flex;
  align-items: center;
  gap: var(${Design.Space.Sm});

  label {
    ${overline}
    white-space: nowrap;
  }
`;
