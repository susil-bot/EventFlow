import React from 'react';
import {
  type FieldErrors,
  SOCIAL_PLATFORMS,
  type SocialLink,
  type SocialPlatform
} from '@/shared/api/types';
import { SOCIAL_LABEL } from '@/features/events/utils/event-format';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { SelectField } from '@/shared/ui/select-field';
import { TextField } from '@/shared/ui/text-field';
import {
  FieldTitle,
  LinkRow,
  RemoveCell,
  StyledSocialLinksField,
  FieldError
} from './styles';

export type SocialLinksFieldProps = {
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
  /** Errors keyed like the API: `socialLinks`, `socialLinks.0.url`. */
  errors?: FieldErrors;
};

/** Edits the event's social links: one link per platform, https only. */
export const SocialLinksField = ({
  links,
  onChange,
  errors = {}
}: SocialLinksFieldProps) => {
  const update = (index: number, patch: Partial<SocialLink>) =>
    onChange(
      links.map((link, i) => (i === index ? { ...link, ...patch } : link))
    );

  const unused = SOCIAL_PLATFORMS.filter(
    (platform) => !links.some((link) => link.platform === platform)
  );
  const [nextPlatform] = unused;

  return (
    <StyledSocialLinksField>
      <FieldTitle>Social links</FieldTitle>
      {links.map((link, index) => (
        <LinkRow key={link.platform}>
          <SelectField
            label={`Platform ${index + 1}`}
            value={link.platform}
            options={SOCIAL_PLATFORMS.filter(
              (platform) =>
                platform === link.platform || unused.includes(platform)
            ).map((platform) => ({
              value: platform,
              label: SOCIAL_LABEL[platform]
            }))}
            onChange={(event) =>
              update(index, { platform: event.target.value as SocialPlatform })
            }
          />
          <TextField
            label={`${SOCIAL_LABEL[link.platform]} link`}
            type="url"
            inputMode="url"
            placeholder="https://"
            value={link.url}
            onChange={(event) => update(index, { url: event.target.value })}
            error={errors[`socialLinks.${index}.url`]}
            maxLength={500}
          />
          <RemoveCell>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange(links.filter((_, i) => i !== index))}
              aria-label={`Remove ${SOCIAL_LABEL[link.platform]} link`}
            >
              <Icon name="trash" size={16} />
            </Button>
          </RemoveCell>
        </LinkRow>
      ))}
      {errors.socialLinks ? (
        <FieldError role="alert">{errors.socialLinks}</FieldError>
      ) : null}
      {nextPlatform ? (
        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              onChange([...links, { platform: nextPlatform, url: '' }])
            }
          >
            <Icon name="plus" size={16} /> Add social link
          </Button>
        </div>
      ) : null}
    </StyledSocialLinksField>
  );
};
