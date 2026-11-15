import React, { useEffect, useId, useRef, useState } from 'react';
import type { User } from '@/shared/api/types';
import { Icon } from '@/shared/ui/icon';
import {
  AccountButton,
  AccountDetails,
  AccountPopover,
  LogoutButton,
  StyledAccountMenu
} from './styles';

const ROLE_LABEL: Record<User['role'], string> = {
  ADMIN: 'Admin',
  ORGANIZER: 'Organizer',
  ATTENDEE: 'Attendee'
};

export const describeAccount = (user: User) =>
  user.status === 'PENDING_APPROVAL'
    ? `${ROLE_LABEL[user.role]} · awaiting approval`
    : ROLE_LABEL[user.role];

export type AccountMenuProps = {
  user: User;
  onLogout: () => void;
};

/** First name of the account, for the header button. */
const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

/** Profile button (person icon + first name) with details and Log out. */
export const AccountMenu = ({ user, onLogout }: AccountMenuProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const closeOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <StyledAccountMenu ref={rootRef}>
      <AccountButton
        type="button"
        aria-expanded={open}
        aria-controls={popoverId}
        aria-label={`Account: ${user.name}`}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="user" size={24} />
        <span>{firstName(user.name)}</span>
      </AccountButton>
      <AccountPopover id={popoverId} hidden={!open}>
        <AccountDetails>
          <strong>{user.name}</strong>
          <span>{user.email}</span>
          <span>{describeAccount(user)}</span>
        </AccountDetails>
        <LogoutButton
          type="button"
          onClick={() => {
            setOpen(false);
            onLogout();
          }}
        >
          <Icon name="logout" size={18} />
          Log out
        </LogoutButton>
      </AccountPopover>
    </StyledAccountMenu>
  );
};
