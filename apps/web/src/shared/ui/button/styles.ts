import { Link } from 'react-router';
import styled, { css } from 'styled-components';
import { Design } from '@/shared/styles/tokens';
import type { ButtonSize, ButtonVariant } from './Button';

type StyleProps = {
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
};

const variants: Record<ButtonVariant, ReturnType<typeof css>> = {
  primary: css`
    background: var(${Design.Color.Primary});
    color: var(${Design.Color.TextInverse});
    &:hover:not(:disabled) {
      background: var(${Design.Color.PrimaryHover});
    }
  `,
  secondary: css`
    background: var(${Design.Color.Surface});
    color: var(${Design.Color.Text});
    border-color: var(${Design.Color.BorderStrong});
    &:hover:not(:disabled) {
      background: var(${Design.Color.SurfaceMuted});
    }
  `,
  ghost: css`
    background: transparent;
    color: var(${Design.Color.Accent});
    &:hover:not(:disabled) {
      background: var(${Design.Color.SurfaceMuted});
    }
  `,
  success: css`
    background: var(${Design.Color.Success});
    color: var(${Design.Color.TextInverse});
    &:hover:not(:disabled) {
      filter: brightness(0.92);
    }
  `,
  danger: css`
    background: var(${Design.Color.Surface});
    color: var(${Design.Color.Danger});
    border-color: currentColor;
    &:hover:not(:disabled) {
      background: var(${Design.Color.DangerSurface});
    }
  `
};

const sizes: Record<ButtonSize, ReturnType<typeof css>> = {
  sm: css`
    padding: 8px 14px;
    font-size: var(${Design.Font.SizeXs});
  `,
  md: css`
    min-height: 48px;
    padding: 12px 28px;
    font-size: var(${Design.Font.SizeSm});
  `,
  lg: css`
    min-height: 56px;
    padding: 14px 36px;
    font-size: var(${Design.Font.SizeSm});
  `
};

const buttonStyles = css<StyleProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(${Design.Space.Xs});
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  border: 1px solid transparent;
  border-radius: var(${Design.Radius.Control});
  font-family: inherit;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 1.2;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background 150ms ease,
    filter 150ms ease;
  ${({ $variant }) => variants[$variant]}
  ${({ $size }) => sizes[$size]}

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const StyledButton = styled.button.withConfig({
  displayName: 'Button'
})<StyleProps>`
  ${buttonStyles}
`;

export const StyledLinkButton = styled(Link).withConfig({
  displayName: 'LinkButton'
})<StyleProps>`
  ${buttonStyles}
`;
