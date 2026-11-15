import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';

export const StyledChipRow = styled.ul.withConfig({
  displayName: 'CategoryChips'
})`
  display: flex;
  flex-wrap: wrap;
  gap: var(${Design.Space.Xs});
  margin: 0 0 var(${Design.Space.Lg});
  padding: 0;
  list-style: none;
`;
