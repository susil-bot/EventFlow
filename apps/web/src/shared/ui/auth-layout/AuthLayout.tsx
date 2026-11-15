import React, { type ReactNode } from 'react';
import {
  AuthCard,
  AuthHero,
  AuthHeroText,
  AuthSubtitle,
  AuthTitle,
  StyledAuthLayout
} from './styles';

export type AuthLayoutProps = {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
};

export const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => (
  <StyledAuthLayout>
    <AuthHero aria-hidden="true">
      <AuthHeroText>
        <strong>EventFlow</strong>
        <span>Create events. Fill every seat. Never overbook.</span>
      </AuthHeroText>
    </AuthHero>
    <main>
      <AuthCard>
        <AuthTitle>{title}</AuthTitle>
        {subtitle ? <AuthSubtitle>{subtitle}</AuthSubtitle> : null}
        {children}
      </AuthCard>
    </main>
  </StyledAuthLayout>
);
