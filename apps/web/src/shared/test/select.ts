import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Picks an option from a `Select` dropdown, the way a user does: open it,
 * then click the option.
 */
export const chooseOption = async (
  trigger: HTMLElement,
  optionName: string | RegExp
) => {
  await userEvent.click(trigger);
  await userEvent.click(screen.getByRole('option', { name: optionName }));
};
