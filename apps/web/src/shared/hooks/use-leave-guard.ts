import { useCallback, useEffect, useRef } from 'react';
import { type Blocker, useBlocker } from 'react-router';

export type LeaveGuard = {
  /**
   * `blocked` while a navigation waits for an answer: show a dialog, then
   * call `proceed()` (leave) or `reset()` (stay).
   */
  blocker: Blocker;
  /** Lets the next navigation through, e.g. right after a successful save. */
  allowNavigation: () => void;
};

/**
 * Protects unsaved work while `when` is true:
 * - In-app navigation (links, the browser's Back/Forward, `navigate()`) is
 *   held by React Router's `useBlocker`, so the page can ask in its own
 *   dialog. Changes that stay on the same page (query string) pass.
 * - Closing or reloading the tab shows the browser's own "Leave site?"
 *   prompt (`beforeunload`; browsers don't allow custom text there).
 */
export const useLeaveGuard = (when: boolean): LeaveGuard => {
  const allowedRef = useRef(false);

  const shouldBlock = useCallback(
    ({
      currentLocation,
      nextLocation
    }: {
      currentLocation: { pathname: string };
      nextLocation: { pathname: string };
    }) =>
      when &&
      !allowedRef.current &&
      currentLocation.pathname !== nextLocation.pathname,
    [when]
  );
  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (!when) {
      return undefined;
    }
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [when]);

  const allowNavigation = useCallback(() => {
    allowedRef.current = true;
  }, []);

  return { blocker, allowNavigation };
};
