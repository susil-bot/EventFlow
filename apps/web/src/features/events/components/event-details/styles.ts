import styled from 'styled-components';
import { BREAKPOINTS, Design } from '@/shared/styles/tokens';
import { displayHeading, overline } from '@/shared/styles/typography';

export const StyledDetails = styled.article.withConfig({
  displayName: 'EventDetails'
})`
  display: grid;
  gap: var(${Design.Space.Xl});
  max-width: 980px;
  margin: 0 auto;

  @media (min-width: ${BREAKPOINTS.md}) {
    grid-template-columns: minmax(260px, 340px) 1fr;
    gap: var(${Design.Space.Xxl});
  }
`;

export const Aside = styled.aside.withConfig({
  displayName: 'EventDetailsAside'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Lg});
`;

export const DetailsColumn = styled.div.withConfig({
  displayName: 'EventDetailsColumn'
})`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(${Design.Space.Md});

  > * {
    align-self: stretch;
  }

  > span:first-child {
    align-self: flex-start;
  }
`;

export const Title = styled.h1.withConfig({
  displayName: 'EventDetailsTitle'
})`
  ${displayHeading}
  font-size: var(${Design.Font.SizeDisplay});
  overflow-wrap: anywhere;
`;

export const Section = styled.section.withConfig({
  displayName: 'EventDetailsSection'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Sm});
`;

export const SectionTitle = styled.h2.withConfig({
  displayName: 'EventDetailsSectionTitle'
})`
  padding-bottom: var(${Design.Space.Xs});
  border-bottom: 1px solid var(${Design.Color.Border});
  ${overline}
  color: var(${Design.Color.TextMuted});
`;

export const HostRow = styled.p.withConfig({
  displayName: 'EventDetailsHostRow'
})`
  display: flex;
  align-items: center;
  gap: var(${Design.Space.Sm});
`;

export const Description = styled.p.withConfig({
  displayName: 'EventDetailsDescription'
})`
  white-space: pre-line;
  line-height: 1.7;
`;

export const BadgeRow = styled.div.withConfig({
  displayName: 'EventDetailsBadgeRow'
})`
  display: flex;
  flex-wrap: wrap;
  gap: var(${Design.Space.Xs});
`;

export const Gallery = styled.ul.withConfig({
  displayName: 'EventDetailsGallery'
})`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: var(${Design.Space.Xs});
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const GalleryImage = styled.img.withConfig({
  displayName: 'EventDetailsGalleryImage'
})`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: var(${Design.Radius.Md});
`;

export const SlotList = styled.ul.withConfig({
  displayName: 'EventDetailsSlotList'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Xs});
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const SlotItem = styled.li.withConfig({
  displayName: 'EventDetailsSlotItem'
})`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(${Design.Space.Sm});
  padding: var(${Design.Space.Sm});
  border: 1px solid var(${Design.Color.Border});
  border-radius: var(${Design.Radius.Md});
  font-size: var(${Design.Font.SizeSm});
`;

export const SlotPlaces = styled.span.withConfig({
  displayName: 'EventDetailsSlotPlaces'
})<{ $full: boolean }>`
  font-weight: 600;
  color: ${({ $full }) =>
    $full ? `var(${Design.Color.Danger})` : `var(${Design.Color.Success})`};
`;

export const CoverWrap = styled.div.withConfig({
  displayName: 'EventDetailsCover'
})`
  position: relative;
`;

/** Organizer/admin status chip, top-left of the cover. */
export const StaffStatus = styled.div.withConfig({
  displayName: 'EventDetailsStaffStatus'
})`
  position: absolute;
  top: var(${Design.Space.Sm});
  left: var(${Design.Space.Sm});
  right: var(${Design.Space.Sm});
  display: flex;
`;

export const DirectionsLink = styled.a.withConfig({
  displayName: 'EventDetailsDirectionsLink'
})`
  display: inline-flex;
  gap: var(${Design.Space.Xxs});
  align-items: center;
  align-self: flex-start;
  min-height: 44px;
  color: var(${Design.Color.Accent});
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:focus-visible {
    outline: 3px solid var(${Design.Color.Focus});
    outline-offset: 2px;
  }
`;
