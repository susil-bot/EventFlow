import { Link } from 'react-router';
import styled from 'styled-components';
import type { PhaseTone } from '@/features/events/utils/event-phase';
import { BREAKPOINTS, Design } from '@/shared/styles/tokens';

export const StyledEventList = styled.section.withConfig({
  displayName: 'OrganizerEventList'
})`
  border: 1px solid var(${Design.Color.Border});
  border-radius: var(${Design.Radius.Sm});
  background: var(${Design.Color.Surface});
  box-shadow: var(${Design.Shadow.Card});

  > ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`;

export const ListHeader = styled.p.withConfig({
  displayName: 'OrganizerEventListHeader'
})`
  padding: var(${Design.Space.Md}) var(${Design.Space.Lg});
  border-bottom: 1px solid var(${Design.Color.Border});
  color: var(${Design.Color.TextMuted});
  font-size: var(${Design.Font.SizeLg});
`;

export const StyledRow = styled.li.withConfig({
  displayName: 'OrganizerEventRow'
})`
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  grid-template-areas:
    'thumb main'
    'actions actions';
  gap: var(${Design.Space.Sm}) var(${Design.Space.Md});
  padding: var(${Design.Space.Md}) var(${Design.Space.Lg});
  border-bottom: 1px solid var(${Design.Color.Border});

  &:last-child {
    border-bottom: 0;
  }

  &:hover {
    background: var(${Design.Color.SurfaceMuted});
  }

  @media (min-width: ${BREAKPOINTS.md}) {
    grid-template-columns: 80px minmax(0, 1fr) auto;
    grid-template-areas: 'thumb main actions';
    align-items: start;
  }
`;

export const Thumb = styled.img.withConfig({
  displayName: 'OrganizerEventThumb'
})`
  grid-area: thumb;
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid var(${Design.Color.Border});
  border-radius: var(${Design.Radius.Sm});
  object-fit: cover;
`;

export const ThumbFallback = styled.span.withConfig({
  displayName: 'OrganizerEventThumbFallback'
})`
  grid-area: thumb;
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid var(${Design.Color.Border});
  border-radius: var(${Design.Radius.Sm});
  background: var(${Design.Color.SurfaceMuted});
  color: var(${Design.Color.TextMuted});
`;

export const RowMain = styled.div.withConfig({
  displayName: 'OrganizerEventRowMain'
})`
  grid-area: main;
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Xs});
  min-width: 0;
`;

export const RowTitle = styled(Link).withConfig({
  displayName: 'OrganizerEventTitle'
})`
  color: var(${Design.Color.Text});
  font-size: var(${Design.Font.SizeLg});
  font-weight: 500;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const Meta = styled.p.withConfig({
  displayName: 'OrganizerEventMeta'
})`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(${Design.Space.Xxs}) var(${Design.Space.Sm});
  color: var(${Design.Color.TextMuted});
  font-size: var(${Design.Font.SizeSm});

  strong {
    color: var(${Design.Color.Text});
    font-weight: 600;
  }
`;

export const Tag = styled.span.withConfig({
  displayName: 'OrganizerEventTag'
})`
  padding: 1px var(${Design.Space.Xs});
  border: 1px solid var(${Design.Color.BorderStrong});
  border-radius: var(${Design.Radius.Control});
  color: var(${Design.Color.Text});
  font-size: var(${Design.Font.SizeXs});
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const Capacity = styled.p.withConfig({
  displayName: 'OrganizerEventCapacity'
})`
  color: var(${Design.Color.Text});
  font-size: var(${Design.Font.SizeSm});
  font-variant-numeric: tabular-nums;
`;

export const RowActions = styled.div.withConfig({
  displayName: 'OrganizerEventRowActions'
})`
  grid-area: actions;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(${Design.Space.Sm});
`;

const TONE_COLOR: Record<PhaseTone, string> = {
  neutral: Design.Color.Text,
  info: Design.Color.Info,
  success: Design.Color.Success,
  warning: Design.Color.Warning,
  danger: Design.Color.Danger
};

const TONE_SURFACE: Record<PhaseTone, string> = {
  neutral: Design.Color.SurfaceMuted,
  info: Design.Color.InfoSurface,
  success: Design.Color.SuccessSurface,
  warning: Design.Color.WarningSurface,
  danger: Design.Color.DangerSurface
};

export const StyledStatusBadge = styled.span.withConfig({
  displayName: 'OrganizerEventStatus'
})<{ $tone: PhaseTone }>`
  display: inline-flex;
  align-items: center;
  gap: var(${Design.Space.Xs});
  min-height: 40px;
  padding: var(${Design.Space.Xxs}) var(${Design.Space.Sm});
  border-radius: var(${Design.Radius.Sm});
  background: ${({ $tone }) => `var(${TONE_SURFACE[$tone]})`};
  color: ${({ $tone }) => `var(${TONE_COLOR[$tone]})`};
  font-size: var(${Design.Font.SizeSm});
  white-space: nowrap;
`;
