import styled, { css } from 'styled-components';
import { BREAKPOINTS, Design } from '@/shared/styles/tokens';
import { displayHeading, overline } from '@/shared/styles/typography';

const resetButton = css`
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
`;

export const SearchBox = styled.div.withConfig({
  displayName: 'CityPickerSearchBox'
})`
  display: flex;
  align-items: center;
  gap: var(${Design.Space.Sm});
  padding: var(${Design.Space.Sm}) var(${Design.Space.Md});
  border: 1px solid var(${Design.Color.BorderStrong});
  border-radius: var(${Design.Radius.Control});
  color: var(${Design.Color.TextMuted});

  &:focus-within {
    outline: 2px solid var(${Design.Color.Focus});
    outline-offset: 2px;
  }
`;

export const SearchInput = styled.input.withConfig({
  displayName: 'CityPickerSearchInput'
})`
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(${Design.Color.Text});
  font-size: var(${Design.Font.SizeLg});

  /* The surrounding box shows the focus ring. */
  &:focus,
  &:focus-visible {
    outline: none;
  }
`;

export const DetectButton = styled.button.withConfig({
  displayName: 'CityPickerDetectButton'
})`
  ${resetButton}
  ${overline}
  display: inline-flex;
  align-items: center;
  gap: var(${Design.Space.Xs});
  margin-top: var(${Design.Space.Md});
  padding: var(${Design.Space.Xs}) 0;
  color: var(${Design.Color.Accent});

  &:disabled {
    cursor: progress;
    opacity: 0.7;
  }
`;

export const StatusMessage = styled.p.withConfig({
  displayName: 'CityPickerStatus'
})`
  min-height: 1.25em;
  margin: var(${Design.Space.Xxs}) 0 0;
  color: var(${Design.Color.Danger});
  font-size: var(${Design.Font.SizeSm});
`;

export const SectionHeading = styled.h3.withConfig({
  displayName: 'CityPickerSectionHeading'
})`
  ${overline}
  margin: var(${Design.Space.Lg}) 0 var(${Design.Space.Md});
  color: var(${Design.Color.TextMuted});
  text-align: center;
`;

const listReset = css`
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const CityGrid = styled.ul.withConfig({
  displayName: 'CityPickerGrid'
})`
  ${listReset}
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(${Design.Space.Lg}) var(${Design.Space.Sm});

  @media (min-width: ${BREAKPOINTS.sm}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (min-width: ${BREAKPOINTS.md}) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
`;

/** Round badge with the city's initial, above its name. */
export const CityBadge = styled.span.withConfig({
  displayName: 'CityPickerBadge'
})`
  ${displayHeading}
  display: grid;
  place-items: center;
  width: 88px;
  aspect-ratio: 1;
  margin-bottom: var(${Design.Space.Xs});
  border-radius: 50%;
  background: var(${Design.Color.AccentSurface});
  color: var(${Design.Color.Accent});
  font-size: 40px;
  line-height: 1;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;

  @media (min-width: ${BREAKPOINTS.md}) {
    width: 104px;
    font-size: 46px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

/**
 * A popular city: round badge, name and upcoming-event count. Hover lifts
 * the badge; the chosen city gets a solid badge with a ring.
 */
export const CityTile = styled.button.withConfig({
  displayName: 'CityPickerTile'
})<{ $muted: boolean }>`
  ${resetButton}
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(${Design.Space.Xxs});
  width: 100%;
  padding: var(${Design.Space.Xs});
  text-align: center;

  strong {
    font-size: var(${Design.Font.SizeMd});
    font-weight: 400;
  }

  > span:last-child {
    ${overline}
    color: ${({ $muted }) =>
      $muted
        ? `var(${Design.Color.TextMuted})`
        : `var(${Design.Color.Accent})`};
  }

  ${({ $muted }) =>
    $muted
      ? css`
          ${CityBadge} {
            background: var(${Design.Color.SurfaceMuted});
            color: var(${Design.Color.TextMuted});
          }
        `
      : ''}

  &:hover ${CityBadge} {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgb(0 0 0 / 10%);
  }

  &:focus-visible {
    outline: none;
  }

  &:focus-visible ${CityBadge} {
    outline: 3px solid var(${Design.Color.Focus});
    outline-offset: 3px;
  }

  &[aria-pressed='true'] ${CityBadge} {
    background: var(${Design.Color.Accent});
    color: var(${Design.Color.TextInverse});
    box-shadow:
      0 0 0 3px var(${Design.Color.Surface}),
      0 0 0 5px var(${Design.Color.Accent});
  }

  &[aria-pressed='true'] strong {
    font-weight: 600;
  }
`;

const selectedOutline = css`
  &[aria-pressed='true'] {
    border-color: var(${Design.Color.BorderStrong});
    background: var(${Design.Color.SurfaceMuted});
  }
`;

export const CityList = styled.ul.withConfig({
  displayName: 'CityPickerList'
})`
  ${listReset}
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(${Design.Space.Xxs}) var(${Design.Space.Md});

  @media (min-width: ${BREAKPOINTS.md}) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
`;

export const CityListItem = styled.button.withConfig({
  displayName: 'CityPickerListItem'
})`
  ${resetButton}
  width: 100%;
  padding: var(${Design.Space.Xs}) var(${Design.Space.Xs});
  border: 1px solid transparent;
  color: var(${Design.Color.TextMuted});
  text-align: left;

  &:hover {
    color: var(${Design.Color.Text});
  }

  ${selectedOutline}
`;

export const ToggleLink = styled.button.withConfig({
  displayName: 'CityPickerToggle'
})`
  ${resetButton}
  ${overline}
  display: block;
  margin: var(${Design.Space.Md}) auto 0;
  color: var(${Design.Color.Accent});
`;

export const AllCitiesButton = styled.button.withConfig({
  displayName: 'CityPickerAllCities'
})`
  ${resetButton}
  ${overline}
  display: block;
  margin: var(${Design.Space.Lg}) auto 0;
  padding: var(${Design.Space.Sm}) var(${Design.Space.Md});
  border: 1px solid var(${Design.Color.Border});
  border-radius: var(${Design.Radius.Control});

  &:hover {
    border-color: var(${Design.Color.BorderStrong});
  }

  ${selectedOutline}
`;

export const ResultsList = styled.ul.withConfig({
  displayName: 'CityPickerResults'
})`
  ${listReset}
  margin-top: var(${Design.Space.Md});
  border-top: 1px solid var(${Design.Color.Border});
`;

export const ResultOption = styled.li.withConfig({
  displayName: 'CityPickerResultOption'
})<{ $active: boolean }>`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(${Design.Space.Xs});
  padding: var(${Design.Space.Sm}) var(${Design.Space.Md});
  border-bottom: 1px solid var(${Design.Color.Border});
  cursor: pointer;
  background: ${({ $active }) =>
    $active ? `var(${Design.Color.SurfaceMuted})` : 'transparent'};

  strong {
    ${displayHeading}
    font-size: var(${Design.Font.SizeLg});
  }

  span {
    color: var(${Design.Color.TextMuted});
    font-size: var(${Design.Font.SizeSm});
  }
`;

export const EmptyResult = styled.li.withConfig({
  displayName: 'CityPickerEmpty'
})`
  padding: var(${Design.Space.Lg}) var(${Design.Space.Md});
  color: var(${Design.Color.TextMuted});
  text-align: center;
`;
