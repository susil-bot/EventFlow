import styled from 'styled-components';
import { BREAKPOINTS, Design } from '@/shared/styles/tokens';

export const Filters = styled.form.withConfig({
  displayName: 'AdminFilters'
})`
  display: grid;
  gap: var(${Design.Space.Sm});
  align-items: end;
  margin-bottom: var(${Design.Space.Lg});

  @media (min-width: ${BREAKPOINTS.md}) {
    grid-template-columns: minmax(200px, 2fr) repeat(2, minmax(160px, 1fr)) auto;
  }
`;

export const SectionTitle = styled.h2.withConfig({
  displayName: 'AdminSectionTitle'
})`
  margin: var(${Design.Space.Xl}) 0 var(${Design.Space.Md});
  font-size: var(${Design.Font.SizeXl});
`;
