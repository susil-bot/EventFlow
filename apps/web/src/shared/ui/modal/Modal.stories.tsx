import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Modal } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Elements/Modal',
  component: Modal,
  args: {
    open: true,
    title: 'Choose your city',
    children: <p>Modal content goes here.</p>
  }
};

export default meta;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {};
