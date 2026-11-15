import { type KeyboardEvent, useCallback, useRef, useState } from 'react';

export type SelectOption = { value: string; label: string };

const TYPEAHEAD_RESET_MS = 600;

/**
 * State and keyboard behaviour of a select-only combobox (WAI-ARIA APG):
 * arrows, Home/End, Enter/Space, Escape, Tab and type-to-find.
 */
export const useSelect = ({
  options,
  value,
  onSelect,
  disabled = false
}: {
  options: SelectOption[];
  value: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [rawActiveIndex, setActiveIndex] = useState(0);
  // Clamped, in case the options shrink while the list is open.
  const activeIndex = Math.min(rawActiveIndex, Math.max(options.length - 1, 0));
  const typed = useRef({ text: '', at: 0 });
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0
  );

  const openList = useCallback(
    (index = selectedIndex) => {
      if (disabled || options.length === 0) {
        return;
      }
      setActiveIndex(index);
      setOpen(true);
    },
    [disabled, options.length, selectedIndex]
  );

  const close = useCallback(() => setOpen(false), []);

  const choose = (index: number) => {
    const option = options[index];
    if (option) {
      onSelect(option.value);
    }
    setOpen(false);
  };

  /** Jumps to the next option starting with what was typed. */
  const typeahead = (key: string) => {
    const now = Date.now();
    const text =
      now - typed.current.at > TYPEAHEAD_RESET_MS
        ? key
        : typed.current.text + key;
    typed.current = { text, at: now };
    const start = open ? activeIndex : selectedIndex;
    const lower = text.toLowerCase();
    const order = [
      ...options.slice(start + (text.length === 1 ? 1 : 0)),
      ...options.slice(0, start + (text.length === 1 ? 1 : 0))
    ];
    const match = order.find((option) =>
      option.label.toLowerCase().startsWith(lower)
    );
    if (!match) {
      return;
    }
    const index = options.indexOf(match);
    if (open) {
      setActiveIndex(index);
    } else {
      onSelect(match.value);
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (disabled) {
      return;
    }
    const last = options.length - 1;
    const move = (index: number) => {
      event.preventDefault();
      if (open) {
        setActiveIndex(Math.min(Math.max(index, 0), last));
      } else {
        openList();
      }
    };
    switch (event.key) {
      case 'ArrowDown':
        move(activeIndex + 1);
        return;
      case 'ArrowUp':
        move(activeIndex - 1);
        return;
      case 'Home':
        move(0);
        return;
      case 'End':
        move(last);
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (open) {
          choose(activeIndex);
        } else {
          openList();
        }
        return;
      case 'Escape':
        if (open) {
          event.preventDefault();
          close();
        }
        return;
      case 'Tab':
        if (open) {
          choose(activeIndex);
        }
        return;
      default:
        if (
          event.key.length === 1 &&
          !event.altKey &&
          !event.ctrlKey &&
          !event.metaKey
        ) {
          typeahead(event.key);
        }
    }
  };

  return {
    open,
    activeIndex,
    setActiveIndex,
    selectedIndex,
    openList,
    close,
    choose,
    onKeyDown
  };
};
