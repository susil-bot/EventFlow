import React, { type ReactNode, useId, useState } from 'react';
import { Icon } from '@/shared/ui/icon';
import {
  ClearButton,
  SectionBody,
  SectionHeader,
  SectionToggle,
  StyledSection
} from './styles';

export type FilterSectionProps = {
  title: string;
  /** A filter in this section is applied: the title is highlighted. */
  active: boolean;
  onClear: () => void;
  defaultOpen?: boolean;
  children: ReactNode;
};

/** Collapsible group of filters with its own Clear. */
export const FilterSection = ({
  title,
  active,
  onClear,
  defaultOpen = false,
  children
}: FilterSectionProps) => {
  const [open, setOpen] = useState(defaultOpen || active);
  const bodyId = useId();
  return (
    <StyledSection>
      <SectionHeader>
        <SectionToggle
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          $active={active}
          onClick={() => setOpen((value) => !value)}
        >
          <Icon name={open ? 'chevronUp' : 'chevronDown'} size={18} />
          {title}
        </SectionToggle>
        <ClearButton
          type="button"
          onClick={onClear}
          disabled={!active}
          aria-label={`Clear ${title.toLowerCase()}`}
        >
          Clear
        </ClearButton>
      </SectionHeader>
      <SectionBody id={bodyId} hidden={!open}>
        {children}
      </SectionBody>
    </StyledSection>
  );
};
