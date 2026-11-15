import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { EditorActions } from './EditorActions';

const meta: Meta<typeof EditorActions> = {
  title: 'Patterns/EditorActions',
  component: EditorActions,
  args: {
    formId: 'story-form',
    mode: 'edit',
    phase: 'DRAFT',
    isDirty: true,
    isScheduling: false,
    previewHref: '/events/react-chennai-meetup',
    menuItems: [
      { label: 'View attendees', onSelect: () => undefined },
      { label: 'Cancel event', onSelect: () => undefined, tone: 'danger' }
    ],
    onExit: () => undefined,
    onPublish: () => undefined
  },
  render: (args) => (
    <div style={{ minHeight: 220 }}>
      <form id="story-form" onSubmit={(event) => event.preventDefault()} />
      <EditorActions {...args} />
    </div>
  )
};

export default meta;

type Story = StoryObj<typeof EditorActions>;

export const DraftWithChanges: Story = {};
export const DraftUnchanged: Story = { args: { isDirty: false } };
export const Scheduling: Story = { args: { isScheduling: true } };
export const Live: Story = { args: { phase: 'LIVE' } };
export const NewEvent: Story = {
  args: {
    mode: 'create',
    phase: undefined,
    previewHref: undefined,
    menuItems: []
  }
};
