import type { Meta, StoryObj } from '@storybook/react-vite';
import { LocationButton } from './LocationButton';

const meta: Meta<typeof LocationButton> = {
  title: 'Patterns/LocationButton',
  component: LocationButton,
  args: { cityName: 'Chennai' }
};

export default meta;

type Story = StoryObj<typeof LocationButton>;

export const WithCity: Story = {};
export const AllCities: Story = { args: { cityName: null } };
