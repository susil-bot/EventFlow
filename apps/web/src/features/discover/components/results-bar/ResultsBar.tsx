import React, { useId } from 'react';
import { EVENT_SORTS, type EventSort } from '@/shared/api/types';
import { Select } from '@/shared/ui/select';
import { SortControl, StyledResultsBar, Summary } from './styles';

export type ResultsBarProps = {
  total: number;
  offset: number;
  /** Number of items on the current page. */
  count: number;
  sort: EventSort;
  onSortChange: (sort: EventSort) => void;
  /** Sort orders on offer; defaults to all of them. */
  sorts?: readonly EventSort[];
};

const SORT_LABEL: Record<EventSort, string> = {
  soonest: 'Soonest first',
  'most-available': 'Most places left',
  newest: 'Recently added',
  nearest: 'Nearest first'
};

/** Formats "1 - 12 of 30 results" (shown in caps by the styles). */
export const describeRange = (total: number, offset: number, count: number) => {
  if (total === 0) {
    return 'No results';
  }
  const noun = total === 1 ? 'result' : 'results';
  return `${offset + 1} - ${offset + count} of ${total} ${noun}`;
};

/** Result count and sort order above a listing. */
export const ResultsBar = ({
  total,
  offset,
  count,
  sort,
  onSortChange,
  sorts = EVENT_SORTS
}: ResultsBarProps) => {
  const sortId = useId();
  return (
    <StyledResultsBar>
      <Summary aria-live="polite">
        {describeRange(total, offset, count)}
      </Summary>
      <SortControl>
        <label htmlFor={sortId}>Sort by:</label>
        <Select
          id={sortId}
          inline
          value={sort}
          options={sorts.map((option) => ({
            value: option,
            label: SORT_LABEL[option]
          }))}
          onChange={(event) => onSortChange(event.target.value as EventSort)}
        />
      </SortControl>
    </StyledResultsBar>
  );
};
