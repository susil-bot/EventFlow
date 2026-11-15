import type { Meta, StoryObj } from '@storybook/react-vite';
import { CategoryChips } from './CategoryChips';

const meta: Meta<typeof CategoryChips> = {
  title: 'Patterns/CategoryChips',
  component: CategoryChips,
  args: {
    selected: ['WORKSHOP'],
    facets: {
      categories: [
        { category: 'WORKSHOP', count: 4 },
        { category: 'MUSIC_SHOW', count: 2 },
        { category: 'COMEDY_SHOW', count: 1 },
        { category: 'EXHIBITION', count: 1 }
      ],
      total: 8
    }
  }
};

export default meta;

type Story = StoryObj<typeof CategoryChips>;

export const Default: Story = {};
export const BeforeCountsLoad: Story = { args: { facets: undefined } };
