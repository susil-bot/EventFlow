import type { Meta, StoryObj } from '@storybook/react-vite';
import { onlineEvent } from '@/shared/test/fixtures/events';
import { SocialLinks } from './SocialLinks';

const meta: Meta<typeof SocialLinks> = {
  title: 'Patterns/SocialLinks',
  component: SocialLinks,
  args: { links: onlineEvent.socialLinks }
};

export default meta;

type Story = StoryObj<typeof SocialLinks>;

export const Default: Story = {};
export const AllPlatforms: Story = {
  args: {
    links: [
      { platform: 'WEBSITE', url: 'https://example.com' },
      { platform: 'X', url: 'https://x.com/example' },
      { platform: 'LINKEDIN', url: 'https://www.linkedin.com/company/example' },
      { platform: 'INSTAGRAM', url: 'https://instagram.com/example' },
      { platform: 'FACEBOOK', url: 'https://facebook.com/example' },
      { platform: 'YOUTUBE', url: 'https://youtube.com/@example' }
    ]
  }
};
