import React from 'react';
import type { SocialLink, SocialPlatform } from '@/shared/api/types';
import { SOCIAL_LABEL } from '../../utils/event-format';
import { Icon, type IconName } from '@/shared/ui/icon';
import { SocialAnchor, StyledSocialLinks } from './styles';

const ICON: Record<SocialPlatform, IconName> = {
  WEBSITE: 'globe',
  X: 'x',
  LINKEDIN: 'linkedin',
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  YOUTUBE: 'youtube'
};

export type SocialLinksProps = {
  links: SocialLink[];
};

/** Icon links to the event's website and social profiles (new tab). */
export const SocialLinks = ({ links }: SocialLinksProps) =>
  links.length === 0 ? null : (
    <StyledSocialLinks>
      {links.map((link) => (
        <li key={link.platform}>
          <SocialAnchor
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${SOCIAL_LABEL[link.platform]} (opens in a new tab)`}
            title={SOCIAL_LABEL[link.platform]}
          >
            <Icon name={ICON[link.platform]} size={18} />
          </SocialAnchor>
        </li>
      ))}
    </StyledSocialLinks>
  );
