import React from 'react';
import { getHue } from '@/shared/ui/avatar';
import {
  CoverArt,
  CoverCaption,
  CoverImage,
  CoverOrb,
  CoverRidge
} from './styles';

export type EventCoverSize = 'thumb' | 'poster' | 'hero';

export type EventCoverProps = {
  title: string;
  size?: EventCoverSize;
  /** Desaturates the art, e.g. for canceled events. */
  muted?: boolean;
  /** Uploaded cover image; generated art is used when absent. */
  imageUrl?: string;
};

/**
 * The event's uploaded cover image, or generated art when it has none. The
 * generated palette is derived from the title so each event keeps a
 * stable, distinct look.
 */
export const EventCover = ({
  title,
  size = 'thumb',
  muted = false,
  imageUrl
}: EventCoverProps) => {
  const hue = getHue(title);
  if (imageUrl) {
    return (
      <CoverArt $hue={hue} $size={size} $muted={muted}>
        <CoverImage src={imageUrl} alt={`Cover image for ${title}`} />
      </CoverArt>
    );
  }
  return (
    <CoverArt $hue={hue} $size={size} $muted={muted} aria-hidden="true">
      <CoverOrb $hue={hue} />
      <CoverRidge $hue={hue} />
      {size === 'thumb' ? null : <CoverCaption>{title}</CoverCaption>}
    </CoverArt>
  );
};
