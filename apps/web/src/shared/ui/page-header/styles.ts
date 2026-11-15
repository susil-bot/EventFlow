import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';
import { displayHeading, overline } from '@/shared/styles/typography';

export const StyledHeader = styled.header.withConfig({
  displayName: 'PageHeader'
})`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(${Design.Space.Md});
  margin-bottom: var(${Design.Space.Lg});
`;

export const HeaderText = styled.div.withConfig({
  displayName: 'PageHeaderText'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Xxs});
`;

/** A div, not a p, so rich content (e.g. a meter) can be passed in. */
export const HeaderDescription = styled.div.withConfig({
  displayName: 'PageHeaderDescription'
})`
  color: var(${Design.Color.TextMuted});
`;

export const HeaderEyebrow = styled.span.withConfig({
  displayName: 'PageHeaderEyebrow'
})`
  ${overline}
  color: var(${Design.Color.TextMuted});
`;

export const HeaderTitle = styled.h1.withConfig({
  displayName: 'PageHeaderTitle'
})`
  ${displayHeading}
  font-size: var(${Design.Font.SizeDisplay});
`;

export const HeaderActions = styled.div.withConfig({
  displayName: 'PageHeaderActions'
})`
  display: flex;
  flex-wrap: wrap;
  gap: var(${Design.Space.Sm});
`;
