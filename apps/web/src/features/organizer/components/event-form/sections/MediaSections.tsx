import React from 'react';
import type { EventImage, SocialLink } from '@/shared/api/types';
import { ImageUploader } from '../../image-uploader';
import { SocialLinksField } from '../../social-links-field';
import { FormSection, FormSectionTitle } from '../styles';
import type { SectionProps } from '../types';

type ImagesSectionProps = Pick<
  SectionProps,
  'values' | 'errors' | 'setField'
> & {
  onUpload: (file: File) => Promise<EventImage>;
};

/** Promo images; the first one is the cover. */
export const ImagesSection = ({
  values,
  errors,
  setField,
  onUpload
}: ImagesSectionProps) => (
  <FormSection>
    <FormSectionTitle>Promo images</FormSectionTitle>
    <ImageUploader
      label="Images"
      images={values.images}
      onChange={(images: EventImage[]) => setField('images', images)}
      onUpload={onUpload}
      error={errors.imageIds}
    />
  </FormSection>
);

type LinksSectionProps = Pick<SectionProps, 'values' | 'errors' | 'setField'>;

/** Website and social media links shown on the event page. */
export const LinksSection = ({
  values,
  errors,
  setField
}: LinksSectionProps) => (
  <FormSection>
    <FormSectionTitle>Links</FormSectionTitle>
    <SocialLinksField
      links={values.socialLinks}
      onChange={(links: SocialLink[]) => setField('socialLinks', links)}
      errors={errors}
    />
  </FormSection>
);
