import styled from 'styled-components';
import { BREAKPOINTS, Design } from '@/shared/styles/tokens';
import type { EventCoverSize } from './EventCover';

type ArtProps = { $hue: number; $size: EventCoverSize; $muted: boolean };

/** Shape per size on small and large screens. */
const ASPECT: Record<EventCoverSize, { small: string; large: string }> = {
  thumb: { small: '16 / 9', large: '16 / 9' },
  poster: { small: '3 / 4', large: '3 / 4' },
  hero: { small: '16 / 9', large: '1 / 1' }
};

const RADIUS: Record<EventCoverSize, string> = {
  thumb: Design.Radius.Md,
  poster: Design.Radius.Sm,
  hero: Design.Radius.Lg
};

export const CoverArt = styled.div.withConfig({
  displayName: 'EventCoverArt'
})<ArtProps>`
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: ${({ $size }) => ASPECT[$size].small};
  max-height: ${({ $size }) => ($size === 'hero' ? '320px' : 'none')};

  @media (min-width: ${BREAKPOINTS.md}) {
    aspect-ratio: ${({ $size }) => ASPECT[$size].large};
    max-height: none;
  }
  border-radius: ${({ $size }) => `var(${RADIUS[$size]})`};
  background: linear-gradient(
    160deg,
    hsl(${({ $hue }) => $hue} 70% 78%) 0%,
    hsl(${({ $hue }) => ($hue + 40) % 360} 65% 62%) 55%,
    hsl(${({ $hue }) => ($hue + 80) % 360} 55% 42%) 100%
  );
  box-shadow: ${({ $size }) =>
    $size === 'hero' ? `var(${Design.Shadow.Raised})` : 'none'};
  filter: ${({ $muted }) => ($muted ? 'grayscale(0.85) opacity(0.8)' : 'none')};
`;

export const CoverOrb = styled.span.withConfig({
  displayName: 'EventCoverOrb'
})<{ $hue: number }>`
  position: absolute;
  top: 30%;
  right: 12%;
  width: 30%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 35%,
    hsl(${({ $hue }) => ($hue + 180) % 360} 100% 92%),
    hsl(${({ $hue }) => ($hue + 200) % 360} 90% 70%)
  );
  opacity: 0.85;
`;

export const CoverRidge = styled.span.withConfig({
  displayName: 'EventCoverRidge'
})<{ $hue: number }>`
  position: absolute;
  left: -10%;
  right: -10%;
  bottom: -30%;
  height: 65%;
  border-radius: 50% 50% 0 0;
  background: hsl(${({ $hue }) => ($hue + 100) % 360} 45% 32% / 0.75);
`;

export const CoverCaption = styled.span.withConfig({
  displayName: 'EventCoverCaption'
})`
  position: absolute;
  top: var(${Design.Space.Lg});
  left: var(${Design.Space.Lg});
  right: var(${Design.Space.Lg});
  font-family: var(${Design.Font.Display});
  font-size: var(${Design.Font.SizeLg});
  line-height: 1.3;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.18);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const CoverImage = styled.img.withConfig({
  displayName: 'EventCoverImage'
})`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
