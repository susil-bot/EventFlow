import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';

export const DialogBody = styled.div.withConfig({
  displayName: 'PublishDialogBody'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Lg});
  max-width: 560px;
  padding-bottom: var(${Design.Space.Lg});
`;

export const ZoneNote = styled.p.withConfig({
  displayName: 'PublishDialogNote'
})`
  color: var(${Design.Color.TextMuted});
  font-size: var(${Design.Font.SizeSm});
`;

export const PageUrl = styled.p.withConfig({
  displayName: 'PublishDialogUrl'
})`
  margin-top: var(${Design.Space.Xxs});
  font-size: var(${Design.Font.SizeMd});
  word-break: break-all;
`;

export const DialogActions = styled.div.withConfig({
  displayName: 'PublishDialogActions'
})`
  display: flex;
  justify-content: flex-end;
  gap: var(${Design.Space.Sm});
  padding-top: var(${Design.Space.Lg});
  border-top: 1px solid var(${Design.Color.Border});
`;
