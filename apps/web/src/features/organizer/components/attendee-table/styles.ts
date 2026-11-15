import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';
import { visuallyHidden } from '@/shared/styles/visually-hidden';

export const TableWrapper = styled.div.withConfig({
  displayName: 'TableWrapper'
})`
  overflow-x: auto;
  border-radius: var(${Design.Radius.Xl});
  background: var(${Design.Color.Surface});
`;

export const StyledTable = styled.table.withConfig({
  displayName: 'DataTable'
})`
  width: 100%;
  border-collapse: collapse;
  font-size: var(${Design.Font.SizeSm});

  caption {
    ${visuallyHidden}
  }

  th {
    padding: var(${Design.Space.Sm}) var(${Design.Space.Md});
    text-align: left;
    font-size: var(${Design.Font.SizeXs});
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(${Design.Color.TextMuted});
    border-bottom: 1px solid var(${Design.Color.Border});
    white-space: nowrap;
  }

  td {
    padding: var(${Design.Space.Sm}) var(${Design.Space.Md});
    border-bottom: 1px solid var(${Design.Color.Border});
    vertical-align: middle;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  tbody tr:hover {
    background: var(${Design.Color.SurfaceMuted});
  }

  a {
    color: var(${Design.Color.Accent});
  }
`;

export const NameCell = styled.span.withConfig({
  displayName: 'AttendeeTableNameCell'
})`
  display: inline-flex;
  align-items: center;
  gap: var(${Design.Space.Xs});
  font-weight: 500;
`;
