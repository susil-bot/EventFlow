import React from 'react';
import {
  EVENT_CATEGORIES,
  EVENT_TYPES,
  type EventCategory,
  type EventFacets
} from '@/shared/api/types';
import { Checkbox } from '@/shared/ui/checkbox';
import { Chip } from '@/shared/ui/chip';
import {
  CATEGORY_PLURAL_LABEL,
  EVENT_TYPE_LABEL
} from '@/features/events/utils/event-format';
import { DATE_LABEL, DATE_OPTIONS } from '../../utils/date-ranges';
import {
  countActiveFilters,
  type DiscoverFilters,
  PRICE_LABEL,
  PRICE_OPTIONS,
  RADIUS_OPTIONS,
  type RadiusOption
} from '../../utils/discover-url';
import { FilterSection } from './FilterSection';
import {
  ChipList,
  ClearAllButton,
  PanelHeader,
  PanelTitle,
  SectionNote,
  StyledPanel,
  TextButton
} from './styles';

export type FilterPanelProps = {
  filters: DiscoverFilters;
  /** Name of the city in the URL; distance needs one. */
  cityName: string | null;
  /** Events per category; counts are shown when known. */
  facets?: EventFacets;
  onChange: (changes: Partial<DiscoverFilters>) => void;
  onChooseCity: () => void;
};

/** Adds or removes a value from a list filter. */
export const toggle = <T,>(list: T[], value: T): T[] =>
  list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];

const radiusLabel = (radius: RadiusOption, cityName: string) =>
  radius === 0 ? `${cityName} only` : `Within ${radius} km`;

/**
 * Left-hand Discover filters. Every click applies straight away (the URL
 * changes), so there is no Search button.
 */
export const FilterPanel = ({
  filters,
  cityName,
  facets,
  onChange,
  onChooseCity
}: FilterPanelProps) => {
  const counts = new Map<EventCategory, number>(
    facets?.categories.map((facet) => [facet.category, facet.count]) ?? []
  );
  const activeCount = countActiveFilters(filters);

  return (
    <StyledPanel aria-label="Filters">
      <PanelHeader>
        <PanelTitle>Filters</PanelTitle>
        {activeCount > 0 ? (
          <ClearAllButton
            type="button"
            onClick={() =>
              onChange({
                categories: [],
                formats: [],
                date: null,
                price: null,
                radiusKm: 0,
                includeOnline: true
              })
            }
          >
            Clear all ({activeCount})
          </ClearAllButton>
        ) : null}
      </PanelHeader>

      <FilterSection
        title="Categories"
        active={filters.categories.length > 0}
        onClear={() => onChange({ categories: [] })}
        defaultOpen
      >
        <ChipList>
          {EVENT_CATEGORIES.map((category) => {
            const count = facets ? (counts.get(category) ?? 0) : undefined;
            const selected = filters.categories.includes(category);
            return (
              <li key={category}>
                <Chip
                  selected={selected}
                  count={count}
                  disabled={count === 0 && !selected}
                  onClick={() =>
                    onChange({
                      categories: toggle(filters.categories, category)
                    })
                  }
                >
                  {CATEGORY_PLURAL_LABEL[category]}
                </Chip>
              </li>
            );
          })}
        </ChipList>
      </FilterSection>

      <FilterSection
        title="Date"
        active={filters.date !== null}
        onClear={() => onChange({ date: null })}
      >
        <ChipList>
          {DATE_OPTIONS.map((date) => (
            <li key={date}>
              <Chip
                selected={filters.date === date}
                onClick={() =>
                  onChange({ date: filters.date === date ? null : date })
                }
              >
                {DATE_LABEL[date]}
              </Chip>
            </li>
          ))}
        </ChipList>
      </FilterSection>

      <FilterSection
        title="Format"
        active={filters.formats.length > 0}
        onClear={() => onChange({ formats: [] })}
      >
        <ChipList>
          {EVENT_TYPES.map((format) => (
            <li key={format}>
              <Chip
                selected={filters.formats.includes(format)}
                onClick={() =>
                  onChange({ formats: toggle(filters.formats, format) })
                }
              >
                {EVENT_TYPE_LABEL[format]}
              </Chip>
            </li>
          ))}
        </ChipList>
      </FilterSection>

      <FilterSection
        title="Price"
        active={filters.price !== null}
        onClear={() => onChange({ price: null })}
      >
        <ChipList>
          {PRICE_OPTIONS.map((price) => (
            <li key={price}>
              <Chip
                selected={filters.price === price}
                onClick={() =>
                  onChange({ price: filters.price === price ? null : price })
                }
              >
                {PRICE_LABEL[price]}
              </Chip>
            </li>
          ))}
        </ChipList>
      </FilterSection>

      <FilterSection
        title="Location"
        active={filters.radiusKm > 0 || !filters.includeOnline}
        onClear={() => onChange({ radiusKm: 0, includeOnline: true })}
      >
        {cityName ? (
          <ChipList>
            {RADIUS_OPTIONS.map((radius) => (
              <li key={radius}>
                <Chip
                  selected={filters.radiusKm === radius}
                  onClick={() => onChange({ radiusKm: radius })}
                >
                  {radiusLabel(radius, cityName)}
                </Chip>
              </li>
            ))}
          </ChipList>
        ) : (
          <SectionNote>
            Showing every city.{' '}
            <TextButton type="button" onClick={onChooseCity}>
              Choose a city
            </TextButton>{' '}
            to search nearby.
          </SectionNote>
        )}
        <Checkbox
          label="Include online events"
          checked={filters.includeOnline}
          onChange={(event) =>
            onChange({ includeOnline: event.target.checked })
          }
        />
      </FilterSection>
    </StyledPanel>
  );
};
