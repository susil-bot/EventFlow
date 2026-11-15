import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { makeAdminUser } from '@/shared/test/fixtures/events';
import { renderWithProviders } from '@/shared/test/render';
import { AdminUserTable } from './AdminUserTable';

const rowFor = (name: string) =>
  screen.getByRole('row', { name: new RegExp(name) });

describe('<AdminUserTable />', () => {
  it('offers the actions that fit each account', async () => {
    const onAction = vi.fn();
    renderWithProviders(
      <AdminUserTable
        currentUserId="adm-1"
        onAction={onAction}
        users={[
          makeAdminUser({
            id: 'pending',
            name: 'Priya Pending',
            status: 'PENDING_APPROVAL'
          }),
          makeAdminUser({
            id: 'gone',
            name: 'Sam Suspended',
            role: 'ATTENDEE',
            status: 'SUSPENDED'
          }),
          makeAdminUser({ id: 'adm-1', name: 'Ada Admin', role: 'ADMIN' })
        ]}
      />
    );

    await userEvent.click(
      within(rowFor('Priya Pending')).getByRole('button', {
        name: 'Approve Priya Pending'
      })
    );
    expect(onAction).toHaveBeenCalledWith({
      type: 'approve',
      userId: 'pending'
    });

    await userEvent.click(
      within(rowFor('Sam Suspended')).getByRole('button', {
        name: 'Reactivate'
      })
    );
    expect(onAction).toHaveBeenLastCalledWith({
      type: 'reactivate',
      userId: 'gone'
    });

    expect(
      within(rowFor('Ada Admin')).queryByRole('button')
    ).not.toBeInTheDocument();
  });

  it('suspends with a reason and switches roles', async () => {
    const onAction = vi.fn();
    renderWithProviders(
      <AdminUserTable
        currentUserId="adm-1"
        onAction={onAction}
        users={[makeAdminUser({ id: 'u1', name: 'Oscar Organizer' })]}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Make attendee' })
    );
    expect(onAction).toHaveBeenCalledWith({
      type: 'changeRole',
      userId: 'u1',
      role: 'ATTENDEE'
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'Suspend Oscar Organizer' })
    );
    await userEvent.type(
      screen.getByRole('textbox', { name: /Reason/ }),
      'Spam'
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Suspend account' })
    );
    expect(onAction).toHaveBeenLastCalledWith({
      type: 'suspend',
      userId: 'u1',
      reason: 'Spam'
    });
  });
});
