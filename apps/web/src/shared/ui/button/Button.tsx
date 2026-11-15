import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';
import type { LinkProps } from 'react-router';
import { Spinner } from '../spinner';
import { StyledButton, StyledLinkButton } from './styles';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'success'
  | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

type SharedProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
};

export type ButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    isLoading?: boolean;
  };

export const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  type = 'button',
  children,
  ...rest
}: ButtonProps) => (
  <StyledButton
    type={type}
    $variant={variant}
    $size={size}
    $fullWidth={fullWidth}
    disabled={disabled || isLoading}
    aria-busy={isLoading || undefined}
    {...rest}
  >
    {isLoading ? <Spinner size="sm" label="Working" /> : null}
    {children}
  </StyledButton>
);

export type LinkButtonProps = SharedProps & Omit<LinkProps, 'children'>;

/** A router link styled as a button, for navigation actions. */
export const LinkButton = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  ...rest
}: LinkButtonProps) => (
  <StyledLinkButton
    $variant={variant}
    $size={size}
    $fullWidth={fullWidth}
    {...rest}
  >
    {children}
  </StyledLinkButton>
);
