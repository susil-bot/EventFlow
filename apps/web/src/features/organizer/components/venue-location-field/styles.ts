import styled from 'styled-components';
import { BREAKPOINTS, Design } from '@/shared/styles/tokens';

export const StyledVenueLocationField = styled.div.withConfig({
  displayName: 'VenueLocationField'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Sm});
`;

export const FieldTitle = styled.span.withConfig({
  displayName: 'VenueLocationFieldTitle'
})`
  font-size: var(${Design.Font.SizeSm});
  font-weight: 600;
`;

export const FieldHint = styled.p.withConfig({
  displayName: 'VenueLocationFieldHint'
})`
  margin: 0;
  font-size: var(${Design.Font.SizeSm});
  color: var(${Design.Color.TextMuted});
`;

export const SearchRow = styled.div.withConfig({
  displayName: 'VenueLocationFieldSearch'
})`
  display: grid;
  gap: var(${Design.Space.Xs});
  align-items: end;

  @media (min-width: ${BREAKPOINTS.sm}) {
    grid-template-columns: 1fr auto;
  }

  /* Line the button up with the input, not with the hint under it. */
  > button {
    min-height: 48px;
  }
`;

export const ResultList = styled.ul.withConfig({
  displayName: 'VenueLocationFieldResults'
})`
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(${Design.Color.BorderStrong});
  background: var(${Design.Color.Surface});

  li + li {
    border-top: 1px solid var(${Design.Color.Border});
  }
`;

export const ResultButton = styled.button.withConfig({
  displayName: 'VenueLocationFieldResult'
})`
  display: flex;
  gap: var(${Design.Space.Sm});
  align-items: flex-start;
  width: 100%;
  min-height: 48px;
  padding: var(${Design.Space.Sm}) var(${Design.Space.Md});
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;

  svg {
    flex: none;
    margin-top: 3px;
  }

  &:hover,
  &:focus-visible {
    background: var(${Design.Color.OptionActive});
  }

  &:focus-visible {
    outline: 3px solid var(${Design.Color.Focus});
    outline-offset: -3px;
  }
`;

export const Note = styled.p.withConfig({
  displayName: 'VenueLocationFieldNote'
})`
  margin: 0;
  font-size: var(${Design.Font.SizeSm});
  color: var(${Design.Color.TextMuted});
`;

export const PinRow = styled.div.withConfig({
  displayName: 'VenueLocationFieldPin'
})`
  display: flex;
  flex-wrap: wrap;
  gap: var(${Design.Space.Sm});
  align-items: center;
  justify-content: space-between;
  font-size: var(${Design.Font.SizeSm});
  color: var(${Design.Color.TextMuted});
  font-variant-numeric: tabular-nums;
`;

export const FieldError = styled.p.withConfig({
  displayName: 'VenueLocationFieldError'
})`
  margin: 0;
  font-size: var(${Design.Font.SizeSm});
  color: var(${Design.Color.Danger});
`;
