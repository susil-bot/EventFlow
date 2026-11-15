import React, {
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState
} from 'react';
import { Icon } from '../icon';
import { MenuItem, MenuList, StyledActionMenu, Trigger } from './styles';

export type ActionMenuItem = {
  label: string;
  onSelect: () => void;
  /** Destructive actions are shown in red. */
  tone?: 'danger';
  disabled?: boolean;
};

export type ActionMenuProps = {
  /** Accessible name of the "···" button, e.g. "More actions". */
  label: string;
  items: ActionMenuItem[];
  /** Which edge the menu lines up with (`end` near the right of a page). */
  align?: 'start' | 'end';
};

/**
 * "···" button with a short menu of secondary actions (WAI-ARIA menu
 * button: Enter/Space/↓ open, ↑/↓ move, Escape closes and returns focus).
 * Renders nothing when there are no items.
 */
export const ActionMenu = ({
  label,
  items,
  align = 'end'
}: ActionMenuProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const focusItem = (index: number) => {
    const buttons =
      rootRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]:not(:disabled)'
      ) ?? [];
    if (buttons.length === 0) {
      return;
    }
    const wrapped = (index + buttons.length) % buttons.length;
    buttons[wrapped]?.focus();
  };

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    focusItem(0);
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  if (items.length === 0) {
    return null;
  }

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const buttons = [
      ...(rootRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]:not(:disabled)'
      ) ?? [])
    ];
    const current = buttons.indexOf(
      document.activeElement as HTMLButtonElement
    );
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusItem(current + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusItem(current - 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <StyledActionMenu ref={rootRef}>
      <Trigger
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <Icon name="more" size={24} />
      </Trigger>
      <MenuList
        id={menuId}
        role="menu"
        aria-label={label}
        hidden={!open}
        $align={align}
        onKeyDown={onMenuKeyDown}
      >
        {items.map((item) => (
          <li key={item.label} role="none">
            <MenuItem
              type="button"
              role="menuitem"
              tabIndex={-1}
              disabled={item.disabled}
              $danger={item.tone === 'danger'}
              onClick={() => {
                close();
                item.onSelect();
              }}
            >
              {item.label}
            </MenuItem>
          </li>
        ))}
      </MenuList>
    </StyledActionMenu>
  );
};
