import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';

export const ListSection = styled.section.withConfig({
  displayName: 'RegistrationListSection'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Sm});
  margin-bottom: var(${Design.Space.Xl});

  > p {
    color: var(${Design.Color.TextMuted});
  }
`;

export const SectionHeading = styled.h2.withConfig({
  displayName: 'RegistrationListHeading'
})`
  font-size: var(${Design.Font.SizeXl});
`;

export const StyledList = styled.ul.withConfig({
  displayName: 'RegistrationList'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Sm});
  margin: 0;
  padding: 0;
  list-style: none;
`;
