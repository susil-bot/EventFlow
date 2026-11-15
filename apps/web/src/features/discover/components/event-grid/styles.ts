import styled from 'styled-components';
import { BREAKPOINTS, Design } from '@/shared/styles/tokens';

export const StyledGrid = styled.ul.withConfig({ displayName: 'EventGrid' })`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(${Design.Space.Xl}) var(${Design.Space.Md});
  margin: 0;
  padding: 0;
  list-style: none;

  @media (min-width: ${BREAKPOINTS.md}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: var(${Design.Space.Lg});
  }

  @media (min-width: ${BREAKPOINTS.lg}) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  > li {
    display: flex;
    min-width: 0;
  }

  > li > * {
    flex: 1;
  }
`;
