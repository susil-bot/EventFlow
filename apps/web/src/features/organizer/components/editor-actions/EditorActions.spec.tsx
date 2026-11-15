import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithProviders } from '@/shared/test/render';
import { EditorActions, type EditorActionsProps } from './EditorActions';

const renderActions = (props: Partial<EditorActionsProps> = {}) => {
  // Records the intent of the button that submitted the form.
  const onSubmit = vi.fn<(intent: string | null | undefined) => void>();
  const onExit = vi.fn();
  const onPublish = vi.fn();
  renderWithProviders(
    <>
      <form
        id="editor"
        onSubmit={(event) => {
          event.preventDefault();
          const { submitter } = event.nativeEvent as SubmitEvent;
          onSubmit(submitter?.getAttribute('value'));
        }}
      />
      <EditorActions
        formId="editor"
        mode="edit"
        phase="DRAFT"
        isDirty={false}
        isScheduling={false}
        onExit={onExit}
        onPublish={onPublish}
        {...props}
      />
    </>
  );
  return { onSubmit, onExit, onPublish };
};

const intentOf = (onSubmit: ReturnType<typeof renderActions>['onSubmit']) =>
  onSubmit.mock.lastCall?.[0];

describe('<EditorActions />', () => {
  it('keeps Save disabled until something changes, and asks before publishing', async () => {
    const { onSubmit, onPublish } = renderActions();

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Publish…' }));
    expect(onPublish).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the form it points at, with the button intent', async () => {
    const { onSubmit } = renderActions({ isDirty: true, isScheduling: true });

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(intentOf(onSubmit)).toBe('save');
    expect(screen.getByRole('button', { name: 'Schedule…' })).toBeEnabled();
  });

  it('offers only "Save changes" once the event is published', () => {
    renderActions({ phase: 'LIVE', isDirty: true });

    expect(
      screen.queryByRole('button', { name: 'Publish…' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled();
  });

  it('previews the saved event in a new tab and closes the editor', async () => {
    const { onExit } = renderActions({ previewHref: '/events/meetup' });

    const preview = screen.getByRole('link', { name: /Preview/ });
    expect(preview).toHaveAttribute('href', '/events/meetup');
    expect(preview).toHaveAttribute('target', '_blank');
    await userEvent.click(screen.getByRole('button', { name: 'Close editor' }));
    expect(onExit).toHaveBeenCalled();
  });

  it('disables Preview until a new event is saved', () => {
    renderActions({ mode: 'create', phase: undefined });
    expect(screen.getByRole('button', { name: /Preview/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });
});
