import React, { type MouseEvent, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { LinkButton } from '../button';
import { Icon } from '../icon';

export type BackLinkProps = {
  /**
   * Where to go when there is no earlier page in this app to return to
   * (the page was opened directly, from a bookmark or a new tab).
   */
  fallback: string;
  /** Visible text; "Back" by default. */
  children?: ReactNode;
};

/**
 * "← Back" that behaves like the browser's Back button: it returns to the
 * page the user came from (with its filters and scroll position), e.g. the
 * editor, the dashboard or a filtered list. Opened directly, it goes to
 * `fallback` instead. It stays a real link to `fallback`, so open-in-new-tab
 * still works.
 */
export const BackLink = ({ fallback, children = 'Back' }: BackLinkProps) => {
  const navigate = useNavigate();
  // React Router gives the first page of a visit the key "default".
  const hasHistory = useLocation().key !== 'default';

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const plainClick =
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey;
    if (hasHistory && plainClick) {
      event.preventDefault();
      void navigate(-1);
    }
  };

  return (
    <LinkButton to={fallback} variant="ghost" size="sm" onClick={handleClick}>
      <Icon name="chevronLeft" size={16} /> {children}
    </LinkButton>
  );
};
