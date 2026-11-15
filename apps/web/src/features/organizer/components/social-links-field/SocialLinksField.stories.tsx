import type { Meta, StoryObj } from '@storybook/react-vite';
import { SocialLinksField } from './SocialLinksField';

const meta: Meta<typeof SocialLinksField> = {
  title: 'Patterns/SocialLinksField',
  component: SocialLinksField,
  args: { links: [], onChange: () => undefined }
};

export default meta;

type Story = StoryObj<typeof SocialLinksField>;

export const Empty: Story = {};
export const WithLinks: Story = {
  args: {
    links: [
      { platform: 'WEBSITE', url: 'https://example.com' },
      { platform: 'LINKEDIN', url: 'https://www.linkedin.com/company/example' }
    ]
  }
};
export const WithError: Story = {
  args: {
    links: [{ platform: 'LINKEDIN', url: 'https://evil.example' }],
    errors: {
      'socialLinks.0.url': "This link doesn't match the selected platform."
    }
  }
};
