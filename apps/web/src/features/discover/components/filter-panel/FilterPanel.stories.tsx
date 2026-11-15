import type { Meta, StoryObj } from '@storybook/react-vite';
import { DEFAULT_FILTERS } from '../../utils/discover-url';
import { FilterPanel } from './FilterPanel';

const meta: Meta<typeof FilterPanel> = {
  title: 'Patterns/FilterPanel',
  component: FilterPanel,
  decorators: [(Story) => <div style={{ maxWidth: 320 }}>{Story()}</div>],
  args: {
    filters: DEFAULT_FILTERS,
    cityName: 'Chennai',
    facets: {
      categories: [
        { category: 'WORKSHOP', count: 4 },
        { category: 'MUSIC_SHOW', count: 2 },
        { category: 'COMEDY_SHOW', count: 1 },
        { category: 'KIDS', count: 1 }
      ],
      total: 8
    }
  }
};

export default meta;

type Story = StoryObj<typeof FilterPanel>;

export const Default: Story = {};
export const WithFilters: Story = {
  args: {
    filters: {
      ...DEFAULT_FILTERS,
      categories: ['WORKSHOP', 'MUSIC_SHOW'],
      date: 'this-weekend',
      price: 'under-500',
      radiusKm: 300
    }
  }
};
export const AllCities: Story = { args: { cityName: null } };
