import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  attendeeUser,
  canceledEvent,
  fullEvent,
  makeEvent,
  makeRegistration,
  slottedEvent,
  organizerUser
} from '@/shared/test/fixtures/events';
import { renderWithProviders } from '@/shared/test/render';
import {
  RegistrationPanel,
  type RegistrationPanelProps
} from './RegistrationPanel';

const setup = (props: Partial<RegistrationPanelProps> = {}) => {
  const handlers = { onRegister: vi.fn(), onCancelRegistration: vi.fn() };
  renderWithProviders(
    <RegistrationPanel
      event={makeEvent()}
      viewer={attendeeUser}
      {...handlers}
      {...props}
    />
  );
  return handlers;
};

describe('<RegistrationPanel />', () => {
  it('lets an attendee register', async () => {
    const { onRegister } = setup();

    await userEvent.click(screen.getByRole('button', { name: 'Register now' }));

    expect(onRegister).toHaveBeenCalledWith();
  });

  it('makes the attendee pick an open time slot first', async () => {
    const { onRegister } = setup({ event: slottedEvent });
    const register = screen.getByRole('button', {
      name: 'Register for this slot'
    });

    expect(register).toBeDisabled();
    // The full morning slot can't be chosen.
    expect(screen.getByRole('radio', { name: /Morning batch/ })).toBeDisabled();

    await userEvent.click(
      screen.getByRole('radio', { name: /Afternoon batch/ })
    );
    await userEvent.click(register);

    expect(onRegister).toHaveBeenCalledWith('slot-2');
  });

  it('lets a registered attendee cancel', async () => {
    const { onCancelRegistration } = setup({
      registration: makeRegistration({ id: 'reg-9' })
    });

    expect(screen.getByText(/You're registered/)).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Cancel registration' })
    );
    // Nothing happens until the attendee confirms.
    expect(onCancelRegistration).not.toHaveBeenCalled();
    await userEvent.click(
      screen.getByRole('button', { name: 'Yes, cancel registration' })
    );
    expect(onCancelRegistration).toHaveBeenCalledWith('reg-9');
  });

  it('keeps the registration when the attendee backs out', async () => {
    const { onCancelRegistration } = setup({
      registration: makeRegistration({ id: 'reg-9' })
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'Cancel registration' })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Keep my place' })
    );

    expect(onCancelRegistration).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'Cancel registration' })
    ).toBeInTheDocument();
  });

  it.each([
    ['full', fullEvent, /event is full/],
    ['canceled', canceledEvent, /has been canceled/]
  ])('offers no registration when the event is %s', (_, event, message) => {
    setup({ event });

    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('asks signed-out visitors to sign in', () => {
    setup({ viewer: null, signInHref: '/login?redirect=/events/evt-1' });

    expect(
      screen.getByRole('link', { name: 'Sign in to register' })
    ).toHaveAttribute('href', '/login?redirect=/events/evt-1');
  });

  it('does not offer registration to organizers', () => {
    setup({ viewer: { ...organizerUser, id: 'someone-else' } });

    expect(
      screen.getByText(/Organizer accounts cannot register/)
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
