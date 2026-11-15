import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';
import { displayHeading, overline } from '@/shared/styles/typography';

export const StyledEditorHeader = styled.header.withConfig({
  displayName: 'EditorHeader'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Sm});
  min-width: 0;
`;

export const Eyebrow = styled.p.withConfig({
  displayName: 'EditorHeaderEyebrow'
})`
  ${overline}
  color: var(${Design.Color.TextMuted});
`;

export const Title = styled.h1.withConfig({
  displayName: 'EditorHeaderTitle'
})`
  ${displayHeading}
  font-size: var(${Design.Font.SizeDisplay});
`;

export const Meta = styled.p.withConfig({
  displayName: 'EditorHeaderMeta'
})`
  color: var(${Design.Color.Text});
`;

export const StatusRow = styled.div.withConfig({
  displayName: 'EditorHeaderStatus'
})`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(${Design.Space.Sm}) var(${Design.Space.Lg});
  font-size: var(${Design.Font.SizeSm});
`;

export const MetaLink = styled.a.withConfig({
  displayName: 'EditorHeaderLink'
})`
  display: inline-flex;
  align-items: center;
  gap: var(${Design.Space.Xxs});
  color: var(${Design.Color.Accent});
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    text-decoration-thickness: 2px;
  }
`;
