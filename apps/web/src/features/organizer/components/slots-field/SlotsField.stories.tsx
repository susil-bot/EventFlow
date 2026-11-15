import type { Meta, StoryObj } from '@storybook/react-vite';
import { SlotsField } from './SlotsField';

const morning = {
  label: 'Morning batch',
  startsAtLocal: '2030-09-03T10:00',
  endsAtLocal: '2030-09-03T12:00',
  capacity: '3'
};

const slots = [
  {
    label: 'Morning batch',
    startsAtLocal: '2030-09-03T10:00',
    endsAtLocal: '2030-09-03T12:00',
    capacity: '3'
  },
  {
    label: 'Afternoon batch',
    startsAtLocal: '2030-09-03T14:00',
    endsAtLocal: '2030-09-03T16:00',
    capacity: '3'
  }
];

const meta: Meta<typeof SlotsField> = {
  title: 'Patterns/SlotsField',
  component: SlotsField,
  args: { slots: [], onChange: () => undefined }
};

export default meta;

type Story = StoryObj<typeof SlotsField>;

export const NoSlots: Story = {};
export const TwoSlots: Story = { args: { slots } };
export const Locked: Story = { args: { slots, locked: true } };
export const WithErrors: Story = {
  args: {
    slots: [{ ...morning, endsAtLocal: '2030-09-03T09:00' }],
    errors: { 'slots.0.endsAtLocal': 'End time must be after the start time.' }
  }
};
