import React, { type ReactNode } from 'react';
import {
  HeaderActions,
  HeaderDescription,
  HeaderEyebrow,
  HeaderText,
  HeaderTitle,
  StyledHeader
} from './styles';

export type PageHeaderProps = {
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  actions?: ReactNode;
};

export const PageHeader = ({
  title,
  eyebrow,
  description,
  actions
}: PageHeaderProps) => (
  <StyledHeader>
    <HeaderText>
      {eyebrow ? <HeaderEyebrow>{eyebrow}</HeaderEyebrow> : null}
      <HeaderTitle>{title}</HeaderTitle>
      {description ? (
        <HeaderDescription>{description}</HeaderDescription>
      ) : null}
    </HeaderText>
    {actions ? <HeaderActions>{actions}</HeaderActions> : null}
  </StyledHeader>
);
