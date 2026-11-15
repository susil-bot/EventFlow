import type { Meta, StoryObj } from '@storybook/react-vite';
import { cities, otherCity } from '@/shared/test/fixtures/cities';
import { CityPicker } from './CityPicker';
import { LocateError } from './locate';

const meta: Meta<typeof CityPicker> = {
  title: 'Patterns/CityPicker',
  component: CityPicker,
  args: {
    open: true,
    cities,
    selectedCityId: 'chennai',
    locate: () => Promise.resolve({ latitude: 13.05, longitude: 80.25 })
  }
};

export default meta;

type Story = StoryObj<typeof CityPicker>;

export const Default: Story = {};

export const WithOtherCities: Story = {
  args: { cities: [...cities, otherCity], selectedCityId: null }
};

export const LocationBlocked: Story = {
  args: {
    locate: () => Promise.reject(new LocateError('denied'))
  }
};
