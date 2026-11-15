import styled from 'styled-components';
import { BREAKPOINTS, Design } from '@/shared/styles/tokens';
import { displayHeading, overline } from '@/shared/styles/typography';

export const DiscoverLayout = styled.div.withConfig({
  displayName: 'DiscoverLayout'
})`
  display: grid;
  gap: var(${Design.Space.Xl});

  @media (min-width: ${BREAKPOINTS.md}) {
    grid-template-columns: 300px minmax(0, 1fr);
    align-items: start;
  }
`;

export const FilterAside = styled.aside.withConfig({
  displayName: 'DiscoverFilterAside'
})`
  display: none;

  @media (min-width: ${BREAKPOINTS.md}) {
    display: block;
  }
`;

export const Results = styled.div.withConfig({
  displayName: 'DiscoverResults'
})`
  min-width: 0;
`;

export const ResultsHeader = styled.div.withConfig({
  displayName: 'DiscoverResultsHeader'
})`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(${Design.Space.Md});
  margin-bottom: var(${Design.Space.Lg});
`;

export const PageTitle = styled.h1.withConfig({
  displayName: 'DiscoverTitle'
})`
  ${displayHeading}
  font-size: var(${Design.Font.SizeDisplay});
`;

export const MobileFiltersButton = styled.button.withConfig({
  displayName: 'DiscoverMobileFilters'
})`
  ${overline}
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: var(${Design.Space.Xs});
  min-height: 44px;
  padding: 0 var(${Design.Space.Md});
  border: 1px solid var(${Design.Color.BorderStrong});
  border-radius: var(${Design.Radius.Control});
  background: var(${Design.Color.Surface});
  color: var(${Design.Color.Text});
  cursor: pointer;

  @media (min-width: ${BREAKPOINTS.md}) {
    display: none;
  }
`;

export const SearchNote = styled.p.withConfig({
  displayName: 'DiscoverSearchNote'
})`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(${Design.Space.Sm});
  margin-bottom: var(${Design.Space.Md});
  font-size: var(${Design.Font.SizeLg});

  button {
    padding: 0;
    border: 0;
    background: transparent;
    color: var(${Design.Color.Accent});
    font: inherit;
    font-size: var(${Design.Font.SizeSm});
    cursor: pointer;
  }
`;

export const DrawerBody = styled.div.withConfig({
  displayName: 'DiscoverFilterDrawer'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Lg});
`;
