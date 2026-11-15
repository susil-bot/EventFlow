import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';

export const StyledStats = styled.section.withConfig({
  displayName: 'DashboardStats'
})`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(${Design.Space.Md});
  margin-bottom: var(${Design.Space.Lg});
`;
