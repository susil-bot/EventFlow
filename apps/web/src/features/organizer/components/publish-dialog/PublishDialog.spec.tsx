import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { chooseOption } from '@/shared/test/select';
import { renderWithProviders } from '@/shared/test/render';
import { PublishDialog, type PublishDialogValues } from './PublishDialog';

const VALUES: PublishDialogValues = {
  slug: 'react-meetup',
  timeZone: 'UTC',
  startsAtLocal: '2099-09-03T18:00',
  slots: [],
  scheduleGoLive: false,
  publishAtLocal: ''
};

const renderDialog = (values: Partial<PublishDialogValues> = {}) => {
  const onConfirm = vi.fn();
  renderWithProviders(
    <PublishDialog
      open
      values={{ ...VALUES, ...values }}
      onConfirm={onConfirm}
      onClose={vi.fn()}
    />
  );
  return { onConfirm };
};

describe('<PublishDialog />', () => {
  it('publishes now by default and shows the event page address', async () => {
    const { onConfirm } = renderDialog();

    expect(
      screen.getByRole('dialog', { name: 'Publish event' })
    ).toBeInTheDocument();
    expect(screen.getByText(/\/events\/react-meetup$/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Publish' }));
    expect(onConfirm).toHaveBeenCalledWith(null);
  });

  it('offers the planned go-live time from the form', async () => {
    const { onConfirm } = renderDialog({
      scheduleGoLive: true,
      publishAtLocal: '2099-09-01T10:00'
    });

    expect(screen.getByRole('combobox', { name: 'Go live' })).toHaveTextContent(
      /Planned go-live/
    );
    await userEvent.click(screen.getByRole('button', { name: 'Schedule' }));
    expect(onConfirm).toHaveBeenCalledWith('2099-09-01T10:00');
  });

  it('checks a new go-live time before scheduling', async () => {
    const { onConfirm } = renderDialog();

    await chooseOption(
      screen.getByRole('combobox', { name: 'Go live' }),
      'Pick a date and time'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Schedule' }));
    expect(
      screen.getByText('Choose when the event should go live.')
    ).toBeInTheDocument();

    await userEvent.type(
      screen.getByLabelText(/Go-live date and time/),
      '2099-09-04T10:00'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Schedule' }));
    expect(
      screen.getByText('The go-live time must be before the event starts.')
    ).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
