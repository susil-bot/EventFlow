import React from 'react';
import {
  EVENT_CATEGORIES,
  type EventCategory,
  type EventFacets
} from '@/shared/api/types';
import { Chip } from '@/shared/ui/chip';
import { CATEGORY_PLURAL_LABEL } from '@/features/events/utils/event-format';
import { StyledChipRow } from './styles';

export type CategoryChipsProps = {
  selected: EventCategory[];
  /** Without counts every category is offered. */
  facets?: EventFacets;
  onToggle: (category: EventCategory) => void;
};

/**
 * Quick category toggles above the results. Only categories that have
 * events (or are selected) are shown, so every chip leads somewhere.
 */
export const CategoryChips = ({
  selected,
  facets,
  onToggle
}: CategoryChipsProps) => {
  const withEvents = new Set(
    facets?.categories
      .filter((facet) => facet.count > 0)
      .map((facet) => facet.category) ?? EVENT_CATEGORIES
  );
  const shown = EVENT_CATEGORIES.filter(
    (category) => withEvents.has(category) || selected.includes(category)
  );
  if (shown.length === 0) {
    return null;
  }
  return (
    <StyledChipRow aria-label="Quick categories">
      {shown.map((category) => (
        <li key={category}>
          <Chip
            selected={selected.includes(category)}
            onClick={() => onToggle(category)}
          >
            {CATEGORY_PLURAL_LABEL[category]}
          </Chip>
        </li>
      ))}
    </StyledChipRow>
  );
};
