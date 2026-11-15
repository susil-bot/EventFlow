import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pager } from './Pager';

const meta: Meta<typeof Pager> = {
  title: 'Patterns/Pager',
  component: Pager,
  args: { total: 346, offset: 12, pageSize: 12 }
};

export default meta;

type Story = StoryObj<typeof Pager>;

export const Default: Story = {};
