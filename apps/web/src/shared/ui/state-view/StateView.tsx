import React, { type ReactNode } from 'react';
import { Button } from '../button';
import { Icon, type IconName } from '../icon';
import { Spinner } from '../spinner';
import { StateIcon, StateMessage, StatePanel, StateTitle } from './styles';

export type StateViewProps = {
  isLoading?: boolean;
  error?: unknown;
  isEmpty?: boolean;
  loadingLabel?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyIcon?: IconName;
  emptyAction?: ReactNode;
  /** Shown for errors; hidden for 4xx errors a retry can't fix. */
  onRetry?: () => void;
  /** Heading for the error state. */
  errorTitle?: string;
  /** Extra action for the error state, e.g. a link back. */
  errorAction?: ReactNode;
  children?: ReactNode;
};

/** 4xx responses (forbidden, not found, …) won't change on retry. */
const isRetryable = (error: unknown) => {
  const status = (error as { status?: unknown } | null)?.status;
  return typeof status !== 'number' || status >= 500;
};

const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.';

/**
 * Renders exactly one of: loading, error (with retry), empty, or children.
 * Every list/detail view goes through this so states stay consistent.
 */
export const StateView = ({
  isLoading = false,
  error,
  isEmpty = false,
  loadingLabel = 'Loading',
  emptyTitle = 'Nothing here yet',
  emptyMessage,
  emptyIcon = 'calendar',
  emptyAction,
  onRetry,
  errorTitle = "We couldn't load this",
  errorAction,
  children
}: StateViewProps) => {
  if (isLoading) {
    return (
      <StatePanel>
        <Spinner size="lg" label={loadingLabel} />
        <StateMessage aria-hidden="true">{loadingLabel}…</StateMessage>
      </StatePanel>
    );
  }

  if (error) {
    return (
      <StatePanel role="alert">
        <StateIcon $tone="danger">
          <Icon name="alert" size={28} />
        </StateIcon>
        <StateTitle>{errorTitle}</StateTitle>
        <StateMessage>{errorMessage(error)}</StateMessage>
        {errorAction}
        {onRetry && isRetryable(error) ? (
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </StatePanel>
    );
  }

  if (isEmpty) {
    return (
      <StatePanel>
        <StateIcon $tone="neutral">
          <Icon name={emptyIcon} size={28} />
        </StateIcon>
        <StateTitle>{emptyTitle}</StateTitle>
        {emptyMessage ? <StateMessage>{emptyMessage}</StateMessage> : null}
        {emptyAction}
      </StatePanel>
    );
  }

  return <>{children}</>;
};
