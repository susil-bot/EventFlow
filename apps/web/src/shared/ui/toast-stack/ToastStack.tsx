import React from 'react';
import { Icon } from '../icon';
import { DismissButton, StyledStack, StyledToast, ToastText } from './styles';

export type ToastTone = 'success' | 'error' | 'info';

export type Toast = {
  id: number;
  tone: ToastTone;
  message: string;
};

export type ToastStackProps = {
  toasts: Toast[];
  onDismiss: (id: number) => void;
};

const ICON = { success: 'check', error: 'alert', info: 'sparkle' } as const;

/** Presentational toast list. State lives in `ToastProvider`. */
export const ToastStack = ({ toasts, onDismiss }: ToastStackProps) => (
  <StyledStack aria-live="polite" aria-relevant="additions">
    {toasts.map((toast) => (
      <StyledToast
        key={toast.id}
        $tone={toast.tone}
        role={toast.tone === 'error' ? 'alert' : 'status'}
      >
        <Icon name={ICON[toast.tone]} size={18} />
        <ToastText>{toast.message}</ToastText>
        <DismissButton
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
        >
          <Icon name="close" size={16} />
        </DismissButton>
      </StyledToast>
    ))}
  </StyledStack>
);
