import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReasonAction } from './ReasonAction';

const meta: Meta<typeof ReasonAction> = {
  title: 'Patterns/ReasonAction',
  component: ReasonAction,
  args: { label: 'Suspend', confirmLabel: 'Suspend account' }
};

export default meta;

type Story = StoryObj<typeof ReasonAction>;

export const Default: Story = {};

export const Loading: Story = { args: { isLoading: true } };
