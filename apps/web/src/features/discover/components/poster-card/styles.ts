import { Link } from 'react-router';
import styled from 'styled-components';
import type { AvailabilityTone } from '@/features/events/utils/event-format';
import { Design } from '@/shared/styles/tokens';
import { displayHeading, overline } from '@/shared/styles/typography';

export const StyledPosterCard = styled.article.withConfig({
  displayName: 'PosterCard'
})`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Xxs});
  min-width: 0;

  &:hover img,
  &:hover [aria-hidden='true'] {
    transform: scale(1.03);
  }

  img,
  [aria-hidden='true'] {
    transition: transform 240ms ease;
  }
`;

export const Poster = styled.div.withConfig({
  displayName: 'PosterCardPoster'
})`
  position: relative;
  overflow: hidden;
  margin-bottom: var(${Design.Space.Sm});
  border-radius: var(${Design.Radius.Sm});
`;

export const DateStrip = styled.p.withConfig({
  displayName: 'PosterCardDate'
})`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: var(${Design.Space.Xs}) var(${Design.Space.Sm});
  background: rgba(0, 0, 0, 0.82);
  color: var(${Design.Color.TextInverse});
  font-size: var(${Design.Font.SizeMd});
`;

const TONE_COLOR: Record<AvailabilityTone, string> = {
  success: Design.Color.Success,
  warning: Design.Color.Warning,
  danger: Design.Color.Danger,
  neutral: Design.Color.Text
};

export const StatusTag = styled.span.withConfig({
  displayName: 'PosterCardStatus'
})<{ $tone: AvailabilityTone }>`
  ${overline}
  position: absolute;
  top: 0;
  right: 0;
  padding: var(${Design.Space.Xxs}) var(${Design.Space.Xs});
  background: ${({ $tone }) => `var(${TONE_COLOR[$tone]})`};
  color: var(${Design.Color.TextInverse});
`;

export const CardTitle = styled.h3.withConfig({
  displayName: 'PosterCardTitle'
})`
  ${displayHeading}
  font-size: var(${Design.Font.SizeXl});
  line-height: 1.2;
`;

export const CardTitleLink = styled(Link).withConfig({
  displayName: 'PosterCardLink'
})`
  color: inherit;
  text-decoration: none;

  /* Makes the whole card clickable without nesting links. */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  &:focus-visible {
    outline: none;
  }

  &:focus-visible::after {
    outline: 2px solid var(${Design.Color.Focus});
    outline-offset: 4px;
  }
`;

export const CardPlace = styled.p.withConfig({
  displayName: 'PosterCardPlace'
})`
  overflow: hidden;
  color: var(${Design.Color.Text});
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CardMeta = styled.p.withConfig({
  displayName: 'PosterCardMeta'
})`
  color: var(${Design.Color.TextMuted});
  font-size: var(${Design.Font.SizeSm});
`;

export const PriceLine = styled.p.withConfig({
  displayName: 'PosterCardPrice'
})`
  display: flex;
  flex-wrap: wrap;
  gap: var(${Design.Space.Xs});
  color: var(${Design.Color.TextMuted});
  font-size: var(${Design.Font.SizeSm});

  strong {
    color: var(${Design.Color.Text});
    font-weight: 500;
  }

  span::before {
    content: '·';
    margin-right: var(${Design.Space.Xs});
  }
`;

/** Organizer/admin status chip, at the top of the card. */
export const StaffStatus = styled.div.withConfig({
  displayName: 'PosterCardStaffStatus'
})`
  display: flex;
  margin-bottom: var(${Design.Space.Xs});
`;
