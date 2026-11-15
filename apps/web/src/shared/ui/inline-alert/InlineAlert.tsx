import React, { type ReactNode } from 'react';
import { Icon } from '../icon';
import {
  AlertAction,
  AlertBody,
  AlertMessage,
  AlertReference,
  AlertTitle,
  StyledInlineAlert
} from './styles';

export type InlineAlertTone = 'danger' | 'warning' | 'info';

export type InlineAlertProps = {
  tone?: InlineAlertTone;
  /** Short headline, e.g. "We couldn't sign you in". */
  title?: string;
  children: ReactNode;
  /** Support reference (request id) shown small, for server errors. */
  reference?: string;
  /** Optional action, e.g. a "Try again" button. */
  action?: ReactNode;
};

/**
 * A message box inside a page or form, for problems that aren't about one
 * field: the server is down, too many attempts, the account is suspended.
 * Announced to screen readers when it appears (`role="alert"`).
 */
export const InlineAlert = ({
  tone = 'danger',
  title,
  children,
  reference,
  action
}: InlineAlertProps) => (
  <StyledInlineAlert role="alert" $tone={tone}>
    <Icon name="alert" size={20} />
    <AlertBody>
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <AlertMessage>{children}</AlertMessage>
      {reference ? (
        <AlertReference>
          Reference: <code>{reference}</code>. Include it if you contact
          support.
        </AlertReference>
      ) : null}
      {action ? <AlertAction>{action}</AlertAction> : null}
    </AlertBody>
  </StyledInlineAlert>
);
