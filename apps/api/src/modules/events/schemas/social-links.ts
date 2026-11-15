import { z } from 'zod';
import { SOCIAL_PLATFORMS, type SocialPlatform } from '../types';
import { MAX_SOCIAL_LINKS } from './limits';
import { httpsUrl, isHttpsUrl } from './urls';

/** Hosts allowed per platform; `null` means any https site. */
const PLATFORM_HOSTS: Record<SocialPlatform, string[] | null> = {
  WEBSITE: null,
  X: ['x.com', 'twitter.com'],
  LINKEDIN: ['linkedin.com'],
  INSTAGRAM: ['instagram.com'],
  FACEBOOK: ['facebook.com', 'fb.com'],
  YOUTUBE: ['youtube.com', 'youtu.be']
};

const matchesPlatform = (platform: SocialPlatform, url: string) => {
  const hosts = PLATFORM_HOSTS[platform];
  if (!hosts || !isHttpsUrl(url)) {
    return true;
  }
  const host = new URL(url).hostname.toLowerCase();
  return hosts.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`)
  );
};

const socialLink = z
  .object({
    platform: z.enum(SOCIAL_PLATFORMS, { error: 'Choose a platform.' }),
    url: httpsUrl('Enter a link.')
  })
  .refine((link) => matchesPlatform(link.platform, link.url), {
    message: "This link doesn't match the selected platform.",
    path: ['url']
  });

export const socialLinks = z
  .array(socialLink)
  .max(MAX_SOCIAL_LINKS, `Add up to ${MAX_SOCIAL_LINKS} social links.`)
  .refine(
    (links) =>
      new Set(links.map((link) => link.platform)).size === links.length,
    'Each platform can be added once.'
  );
