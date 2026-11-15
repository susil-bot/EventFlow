import styled, { keyframes } from 'styled-components';
import { Design } from '@/shared/styles/tokens';
import type { ToastTone } from './ToastStack';

const ACCENT: Record<ToastTone, string> = {
  success: Design.Color.Success,
  error: Design.Color.Danger,
  info: Design.Color.Info
};

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const StyledStack = styled.div.withConfig({
  displayName: 'ToastStack'
})`
  position: fixed;
  right: var(${Design.Space.Lg});
  bottom: var(${Design.Space.Lg});
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Xs});
  width: min(380px, calc(100vw - 32px));
`;

export const StyledToast = styled.div.withConfig({
  displayName: 'Toast'
})<{ $tone: ToastTone }>`
  display: flex;
  align-items: flex-start;
  gap: var(${Design.Space.Sm});
  padding: var(${Design.Space.Sm}) var(${Design.Space.Md});
  border-left: 4px solid var(${({ $tone }) => ACCENT[$tone]});
  border-radius: var(${Design.Radius.Md});
  background: var(${Design.Color.Surface});
  box-shadow: var(${Design.Shadow.Raised});
  color: var(${Design.Color.Text});
  animation: ${slideIn} 180ms ease-out;

  > svg {
    margin-top: 2px;
    color: var(${({ $tone }) => ACCENT[$tone]});
  }
`;

export const ToastText = styled.p.withConfig({ displayName: 'ToastText' })`
  flex: 1;
  font-size: var(${Design.Font.SizeSm});
`;

export const DismissButton = styled.button.withConfig({
  displayName: 'ToastDismiss'
})`
  display: inline-flex;
  padding: 2px;
  border: 0;
  border-radius: var(${Design.Radius.Sm});
  background: transparent;
  color: var(${Design.Color.TextMuted});
  cursor: pointer;
`;
