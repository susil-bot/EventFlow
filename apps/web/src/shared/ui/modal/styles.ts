import styled, { css } from 'styled-components';
import { BREAKPOINTS, Design } from '@/shared/styles/tokens';
import { visuallyHidden } from '@/shared/styles/visually-hidden';

export const Backdrop = styled.div.withConfig({ displayName: 'ModalBackdrop' })`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: var(${Design.Space.Md});
  background: rgba(16, 24, 40, 0.55);
  overflow-y: auto;

  @media (min-width: ${BREAKPOINTS.md}) {
    padding: var(${Design.Space.Xxl}) var(${Design.Space.Lg});
  }
`;

export const ModalPanel = styled.div.withConfig({ displayName: 'ModalPanel' })`
  width: 100%;
  max-width: 960px;
  background: var(${Design.Color.Surface});
  box-shadow: var(${Design.Shadow.Raised});
`;

export const ModalHeader = styled.div.withConfig({
  displayName: 'ModalHeader'
})<{ $hideTitle: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $hideTitle }) =>
    $hideTitle ? 'flex-end' : 'space-between'};
  gap: var(${Design.Space.Md});
  padding: var(${Design.Space.Md}) var(${Design.Space.Lg}) 0;
`;

export const ModalTitle = styled.h2.withConfig({
  displayName: 'ModalTitle'
})<{ $hidden: boolean }>`
  font-size: var(${Design.Font.SizeXl});
  ${({ $hidden }) =>
    $hidden &&
    css`
      ${visuallyHidden}
    `}
`;

export const CloseButton = styled.button.withConfig({
  displayName: 'ModalCloseButton'
})`
  display: inline-flex;
  padding: var(${Design.Space.Xs});
  border: 0;
  background: transparent;
  color: var(${Design.Color.Text});
  cursor: pointer;
`;

export const ModalBody = styled.div.withConfig({ displayName: 'ModalBody' })`
  padding: var(${Design.Space.Sm}) var(${Design.Space.Lg})
    var(${Design.Space.Lg});
`;
