import type { Meta, StoryObj } from '@storybook/react-vite';
import { adminUser, organizerUser } from '@/shared/test/fixtures/events';
import { SiteHeader } from './SiteHeader';

const meta: Meta<typeof SiteHeader> = {
  title: 'Templates/SiteHeader',
  component: SiteHeader,
  parameters: { layout: 'fullscreen' },
  args: {
    user: null,
    cityName: 'Chennai',
    discoverTo: '/discover/events-chennai',
    query: ''
  }
};

export default meta;

type Story = StoryObj<typeof SiteHeader>;

export const Visitor: Story = {};
export const Organizer: Story = { args: { user: organizerUser } };
export const Admin: Story = { args: { user: adminUser, cityName: null } };
