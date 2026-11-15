import React, { useEffect, useId, useRef } from 'react';
import { Icon } from '../icon';
import {
  Chevron,
  Option,
  OptionList,
  StyledSelect,
  Trigger,
  TriggerText
} from './styles';
import { type SelectOption, useSelect } from './use-select';

export type { SelectOption };

/** The value a change handler receives, shaped like a native change event. */
export type SelectChange = { target: { value: string; name?: string } };

export type SelectProps = {
  options: SelectOption[];
  value: string;
  onChange: (event: SelectChange) => void;
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  /** Shows the error outline and sets `aria-invalid`. */
  hasError?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  /** Width follows the content instead of filling the row. */
  inline?: boolean;
};

/**
 * Dropdown in the editorial style: a square outlined control with a
 * chevron, opening a list whose rows are separated by hairlines and
 * highlighted in grey. Built as an accessible select-only combobox
 * (keyboard: arrows, Home/End, Enter/Space, Escape, type-to-find), since a
 * native `<select>` menu can't be styled.
 */
export const Select = ({
  options,
  value,
  onChange,
  id: idProp,
  name,
  disabled = false,
  required,
  hasError = false,
  'aria-label': ariaLabel,
  'aria-describedby': describedBy,
  inline = false
}: SelectProps) => {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const listId = `${id}-listbox`;
  const optionId = (index: number) => `${id}-option-${index}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const select = useSelect({
    options,
    value,
    disabled,
    onSelect: (next) => {
      if (next !== value) {
        onChange({ target: { value: next, name } });
      }
    }
  });
  const { open, activeIndex, close } = select;
  const current = options[select.selectedIndex];

  // Close when clicking anywhere else.
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open, close]);

  // Keep the highlighted row in view (long lists such as time zones).
  useEffect(() => {
    if (open) {
      listRef.current
        ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
        ?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [open, activeIndex]);

  return (
    <StyledSelect ref={rootRef} $inline={inline}>
      <Trigger
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        aria-invalid={hasError || undefined}
        aria-required={required || undefined}
        disabled={disabled}
        $hasError={hasError}
        $open={open}
        onClick={() => (open ? close() : select.openList())}
        onKeyDown={select.onKeyDown}
        // Space would otherwise "click" the button on key up.
        onKeyUp={(event) => {
          if (event.key === ' ') {
            event.preventDefault();
          }
        }}
      >
        <TriggerText>{current?.label ?? ''}</TriggerText>
        <Chevron $open={open}>
          <Icon name="chevronDown" size={20} />
        </Chevron>
      </Trigger>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <OptionList
        ref={listRef}
        id={listId}
        role="listbox"
        aria-labelledby={id}
        hidden={!open}
        tabIndex={-1}
      >
        {open
          ? options.map((option, index) => (
              <Option
                key={option.value}
                id={optionId(index)}
                role="option"
                data-index={index}
                aria-selected={index === select.selectedIndex}
                $active={index === activeIndex}
                onMouseEnter={() => select.setActiveIndex(index)}
                // Keep focus on the trigger while clicking an option.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select.choose(index)}
              >
                {option.label}
              </Option>
            ))
          : null}
      </OptionList>
    </StyledSelect>
  );
};
