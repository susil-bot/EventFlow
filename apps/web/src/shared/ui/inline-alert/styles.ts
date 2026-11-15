import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';
import type { InlineAlertTone } from './InlineAlert';

const TONES: Record<InlineAlertTone, { color: string; background: string }> = {
  danger: {
    color: Design.Color.Danger,
    background: Design.Color.DangerSurface
  },
  warning: {
    color: Design.Color.Warning,
    background: Design.Color.WarningSurface
  },
  info: { color: Design.Color.Info, background: Design.Color.InfoSurface }
};

export const StyledInlineAlert = styled.div.withConfig({
  displayName: 'InlineAlert'
})<{ $tone: InlineAlertTone }>`
  display: flex;
  align-items: flex-start;
  gap: var(${Design.Space.Sm});
  padding: var(${Design.Space.Md});
  border-left: 4px solid var(${({ $tone }) => TONES[$tone].color});
  background: var(${({ $tone }) => TONES[$tone].background});
  color: var(${Design.Color.Text});

  > svg {
    flex: none;
    margin-top: 2px;
    color: var(${({ $tone }) => TONES[$tone].color});
  }
`;

export const AlertBody = styled.div.withConfig({
  displayName: 'InlineAlertBody'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Xxs});
  min-width: 0;
`;

export const AlertTitle = styled.p.withConfig({
  displayName: 'InlineAlertTitle'
})`
  margin: 0;
  font-weight: 600;
`;

export const AlertMessage = styled.div.withConfig({
  displayName: 'InlineAlertMessage'
})`
  font-size: var(${Design.Font.SizeSm});
`;

export const AlertReference = styled.p.withConfig({
  displayName: 'InlineAlertReference'
})`
  margin: 0;
  color: var(${Design.Color.TextMuted});
  font-size: var(${Design.Font.SizeXs});

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    user-select: all;
  }
`;

export const AlertAction = styled.div.withConfig({
  displayName: 'InlineAlertAction'
})`
  margin-top: var(${Design.Space.Xs});
`;
