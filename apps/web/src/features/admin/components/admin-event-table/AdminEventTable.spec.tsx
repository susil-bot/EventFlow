import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { draftEvent, makeEvent } from '@/shared/test/fixtures/events';
import { renderWithProviders } from '@/shared/test/render';
import { AdminEventTable } from './AdminEventTable';

describe('<AdminEventTable />', () => {
  it('cancels an event with a reason and shows reasons for canceled ones', async () => {
    const onCancel = vi.fn();
    renderWithProviders(
      <AdminEventTable
        onCancel={onCancel}
        events={[
          draftEvent,
          makeEvent({
            id: 'gone',
            title: 'Called off',
            status: 'CANCELED',
            cancellationReason: 'Venue closed'
          })
        ]}
      />
    );

    expect(screen.getByText('Venue closed')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: `Cancel ${draftEvent.title}` })
    );
    await userEvent.type(
      screen.getByRole('textbox', { name: /Reason/ }),
      'Policy violation'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Cancel event' }));

    expect(onCancel).toHaveBeenCalledWith(draftEvent.id, 'Policy violation');
  });

  it('opens any event in the editor, with no one-click publishing', () => {
    renderWithProviders(
      <AdminEventTable
        onCancel={vi.fn()}
        events={[
          draftEvent,
          makeEvent({ id: 'empty', title: 'Nobody yet', registeredCount: 0 })
        ]}
      />
    );

    expect(
      screen.getByRole('link', { name: `Edit ${draftEvent.title}` })
    ).toHaveAttribute('href', `/admin/events/${draftEvent.id}/edit`);
    expect(
      screen.queryByRole('button', { name: /^(Publish|Unpublish)/ })
    ).not.toBeInTheDocument();
  });
});
