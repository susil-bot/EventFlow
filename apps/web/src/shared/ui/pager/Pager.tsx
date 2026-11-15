import React from 'react';
import { Button } from '../button';
import { StyledPager } from './styles';

export type PagerProps = {
  total: number;
  offset: number;
  pageSize: number;
  onOffsetChange: (offset: number) => void;
  /** What's being paged, for screen readers (e.g. "events"). */
  label?: string;
};

/** Previous / Next for offset-paged lists. Hidden when there is one page. */
export const Pager = ({
  total,
  offset,
  pageSize,
  onOffsetChange,
  label = 'results'
}: PagerProps) => {
  if (total <= pageSize) {
    return null;
  }
  const page = Math.floor(offset / pageSize) + 1;
  const pages = Math.ceil(total / pageSize);
  return (
    <StyledPager aria-label={`Pages of ${label}`}>
      <Button
        variant="secondary"
        size="sm"
        disabled={offset === 0}
        onClick={() => onOffsetChange(Math.max(offset - pageSize, 0))}
      >
        Previous
      </Button>
      <span>
        Page {page} of {pages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={offset + pageSize >= total}
        onClick={() => onOffsetChange(offset + pageSize)}
      >
        Next
      </Button>
    </StyledPager>
  );
};
