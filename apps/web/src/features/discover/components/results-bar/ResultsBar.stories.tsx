import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResultsBar } from './ResultsBar';

const meta: Meta<typeof ResultsBar> = {
  title: 'Patterns/ResultsBar',
  component: ResultsBar,
  args: { total: 346, offset: 0, count: 12, sort: 'soonest' }
};

export default meta;

type Story = StoryObj<typeof ResultsBar>;

export const Default: Story = {};

export const Empty: Story = { args: { total: 0, count: 0 } };
