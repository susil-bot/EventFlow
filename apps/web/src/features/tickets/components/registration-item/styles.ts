import { Link } from 'react-router';
import styled from 'styled-components';
import { BREAKPOINTS, Design } from '@/shared/styles/tokens';

export const StyledItem = styled.li.withConfig({
  displayName: 'RegistrationItem'
})<{ $inactive: boolean }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(${Design.Space.Md});
  align-items: center;
  padding: var(${Design.Space.Md});
  border-radius: var(${Design.Radius.Xl});
  background: var(${Design.Color.Surface});
  opacity: ${({ $inactive }) => ($inactive ? 0.75 : 1)};

  @media (min-width: ${BREAKPOINTS.sm}) {
    grid-template-columns: 160px 1fr auto;
  }
`;

export const ItemCover = styled.div.withConfig({
  displayName: 'RegistrationItemCover'
})`
  width: 100%;
`;

export const ItemBody = styled.div.withConfig({
  displayName: 'RegistrationItemBody'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Xxs});
  min-width: 0;
`;

export const ItemStatus = styled.div.withConfig({
  displayName: 'RegistrationItemStatus'
})`
  display: flex;
  flex-wrap: wrap;
  gap: var(${Design.Space.Xs});
`;

export const ItemTitle = styled.h3.withConfig({
  displayName: 'RegistrationItemTitle'
})`
  font-size: var(${Design.Font.SizeLg});
`;

export const ItemTitleLink = styled(Link).withConfig({
  displayName: 'RegistrationItemTitleLink'
})`
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const ItemMeta = styled.div.withConfig({
  displayName: 'RegistrationItemMeta'
})`
  display: flex;
  flex-wrap: wrap;
  gap: var(${Design.Space.Xxs}) var(${Design.Space.Lg});
  font-size: var(${Design.Font.SizeSm});
  color: var(${Design.Color.TextMuted});

  span {
    display: inline-flex;
    align-items: center;
    gap: var(${Design.Space.Xxs});
  }
`;

export const ItemActions = styled.div.withConfig({
  displayName: 'RegistrationItemActions'
})`
  display: flex;
  flex-wrap: wrap;
  gap: var(${Design.Space.Xs});
`;

export const ItemNote = styled.p.withConfig({
  displayName: 'RegistrationItemNote'
})`
  margin: 0;
  font-size: var(${Design.Font.SizeXs});
  color: var(${Design.Color.Danger});
`;
