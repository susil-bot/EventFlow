import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';

export const StyledList = styled.ol.withConfig({
  displayName: 'AuditLogList'
})`
  list-style: none;
  margin: 0;
  padding: 0;
  border-radius: var(${Design.Radius.Xl});
  background: var(${Design.Color.Surface});
`;

export const Entry = styled.li.withConfig({
  displayName: 'AuditLogEntry'
})`
  display: flex;
  justify-content: space-between;
  gap: var(${Design.Space.Md});
  padding: var(${Design.Space.Sm}) var(${Design.Space.Md});
  border-bottom: 1px solid var(${Design.Color.Border});
  font-size: var(${Design.Font.SizeSm});

  &:last-child {
    border-bottom: 0;
  }
`;

export const EntryReason = styled.span.withConfig({
  displayName: 'AuditLogEntryReason'
})`
  display: block;
  color: var(${Design.Color.TextMuted});
`;

export const EntryMeta = styled.span.withConfig({
  displayName: 'AuditLogEntryMeta'
})`
  flex-shrink: 0;
  font-size: var(${Design.Font.SizeXs});
  color: var(${Design.Color.TextMuted});
`;
