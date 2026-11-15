import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';
import { overline } from '@/shared/styles/typography';

export const StyledPager = styled.nav.withConfig({
  displayName: 'Pager'
})`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(${Design.Space.Md});
  margin-top: var(${Design.Space.Xl});

  span {
    ${overline}
    color: var(${Design.Color.TextMuted});
  }
`;
