import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { makeEvent, makeRegistration } from '@/shared/test/fixtures/events';
import { renderWithProviders } from '@/shared/test/render';
import { RegistrationList } from './RegistrationList';

describe('<RegistrationList />', () => {
  it("shows the event's cover image, or generated art without one", () => {
    renderWithProviders(
      <RegistrationList
        onCancel={vi.fn()}
        registrations={[
          makeRegistration({
            event: makeEvent({
              images: [{ id: 'img-1', url: '/uploads/cover.jpg' }]
            })
          }),
          makeRegistration({
            id: 'reg-2',
            event: makeEvent({ id: 'e2', title: 'No image event' })
          })
        ]}
      />
    );

    expect(
      screen.getByRole('img', { name: 'Cover image for React Chennai Meetup' })
    ).toHaveAttribute('src', '/uploads/cover.jpg');
    expect(
      screen.queryByRole('img', { name: 'Cover image for No image event' })
    ).not.toBeInTheDocument();
  });

  it('separates canceled registrations and only offers cancel on active ones', async () => {
    const onCancel = vi.fn();
    renderWithProviders(
      <RegistrationList
        onCancel={onCancel}
        registrations={[
          makeRegistration({ id: 'active' }),
          makeRegistration({
            id: 'old',
            status: 'CANCELED',
            canceledAt: '2030-08-12T10:00:00.000Z',
            event: makeEvent({ id: 'e2', title: 'Old event' })
          })
        ]}
      />
    );

    const canceledSection = screen.getByRole('region', { name: /Canceled/ });
    expect(within(canceledSection).getByText('Old event')).toBeInTheDocument();
    expect(
      within(canceledSection).queryByRole('button')
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Cancel registration for React Chennai Meetup'
      })
    );
    expect(onCancel).not.toHaveBeenCalled();
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Confirm cancel registration for React Chennai Meetup'
      })
    );
    expect(onCancel).toHaveBeenCalledWith('active');
  });

  it('lists registrations for events the organizer canceled under Canceled', () => {
    renderWithProviders(
      <RegistrationList
        onCancel={vi.fn()}
        registrations={[
          makeRegistration({
            id: 'gone',
            event: makeEvent({
              id: 'e3',
              title: 'Called off',
              status: 'CANCELED'
            })
          })
        ]}
      />
    );

    expect(
      within(screen.getByRole('region', { name: /Canceled/ })).getByText(
        'Called off'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Upcoming (0)')).toBeInTheDocument();
  });
});
