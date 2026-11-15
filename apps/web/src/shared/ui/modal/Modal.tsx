import React, {
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef
} from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../icon';
import {
  Backdrop,
  CloseButton,
  ModalBody,
  ModalHeader,
  ModalPanel,
  ModalTitle
} from './styles';

export type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Element to focus when the modal opens (defaults to the first control). */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Hide the title visually but keep it for screen readers. */
  hideTitle?: boolean;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog: rendered in a portal, labelled by its title, traps
 * Tab inside, closes on Escape or backdrop click, locks page scroll and
 * returns focus to whatever opened it.
 */
export const Modal = ({
  open,
  title,
  onClose,
  children,
  initialFocusRef,
  hideTitle = false
}: ModalProps) => {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const target =
      initialFocusRef?.current ??
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    target?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open, initialFocusRef]);

  if (!open) {
    return null;
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab' || !panelRef.current) {
      return;
    }
    const focusable = [
      ...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
    ];
    const [first] = focusable;
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  return createPortal(
    <Backdrop
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <ModalPanel
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
      >
        <ModalHeader $hideTitle={hideTitle}>
          <ModalTitle id={titleId} $hidden={hideTitle}>
            {title}
          </ModalTitle>
          <CloseButton type="button" onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </CloseButton>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
      </ModalPanel>
    </Backdrop>,
    document.body
  );
};
