import React, { useMemo, useState } from 'react';
import { Navigate } from 'react-router';
import { EVENT_SORTS } from '@/shared/api/types';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { Modal } from '@/shared/ui/modal';
import { Pager } from '@/shared/ui/pager';
import { StateView } from '@/shared/ui/state-view';
import { useAuth } from '@/app/providers/AuthProvider';
import { usePublicEvents } from '@/features/events/hooks/use-events';
import { CategoryChips } from '../components/category-chips';
import { EventGrid } from '../components/event-grid';
import { FilterPanel, toggle } from '../components/filter-panel';
import { ResultsBar } from '../components/results-bar';
import { useEventFacets } from '../hooks/use-discover';
import {
  countActiveFilters,
  DEFAULT_FILTERS,
  discoverHref,
  PAGE_SIZE,
  toDiscoverQuery,
  toFilterQuery
} from '../utils/discover-url';
import { useDiscoverRoute } from './use-discover-route';
import {
  DiscoverLayout,
  DrawerBody,
  FilterAside,
  MobileFiltersButton,
  PageTitle,
  Results,
  ResultsHeader,
  SearchNote
} from './styles';

const SORTS_WITHOUT_CITY = EVENT_SORTS.filter((sort) => sort !== 'nearest');

/**
 * `/discover/events-<city>`: filter panel on the left (a drawer on small
 * screens), quick category chips and a grid of poster cards.
 */
export const DiscoverPage = () => {
  const { cityId, city, filters, isUnknownCity, update, openCityPicker } =
    useDiscoverRoute();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();

  // Date windows are resolved when the filters change, not on every
  // render, so the query keys stay stable.
  const query = useMemo(
    () => toDiscoverQuery(filters, cityId),
    [filters, cityId]
  );
  const facetQuery = useMemo(
    () => toFilterQuery(filters, cityId),
    [filters, cityId]
  );
  const { data, isLoading, error, refetch } = usePublicEvents(query);
  const { data: facets } = useEventFacets(facetQuery);

  if (isUnknownCity) {
    return <Navigate to={discoverHref(null, filters)} replace />;
  }

  const events = data?.items ?? [];
  const activeCount = countActiveFilters(filters);
  const isFiltered = activeCount > 0 || filters.q !== '';
  const cityName = city?.name ?? null;
  const panel = (
    <FilterPanel
      filters={filters}
      cityName={cityName}
      facets={facets}
      onChange={update}
      onChooseCity={() => {
        setDrawerOpen(false);
        openCityPicker();
      }}
    />
  );

  return (
    <DiscoverLayout>
      <FilterAside>{panel}</FilterAside>
      <Results>
        <ResultsHeader>
          <PageTitle>
            {cityName ? `Events in ${cityName}` : 'Events in all cities'}
          </PageTitle>
          <MobileFiltersButton
            type="button"
            onClick={() => setDrawerOpen(true)}
          >
            <Icon name="filter" size={18} />
            Filters{activeCount > 0 ? ` (${activeCount})` : ''}
          </MobileFiltersButton>
        </ResultsHeader>
        {filters.q ? (
          <SearchNote>
            Results for “{filters.q}”
            <button type="button" onClick={() => update({ q: '' })}>
              Clear search
            </button>
          </SearchNote>
        ) : null}
        <CategoryChips
          selected={filters.categories}
          facets={facets}
          onToggle={(category) =>
            update({ categories: toggle(filters.categories, category) })
          }
        />
        {data ? (
          <ResultsBar
            total={data.total}
            offset={(filters.page - 1) * PAGE_SIZE}
            count={events.length}
            sort={query.sort ?? 'soonest'}
            sorts={cityId ? EVENT_SORTS : SORTS_WITHOUT_CITY}
            onSortChange={(sort) => update({ sort })}
          />
        ) : null}
        <StateView
          isLoading={isLoading}
          loadingLabel="Loading events"
          error={error}
          onRetry={() => void refetch()}
          isEmpty={events.length === 0}
          emptyTitle={
            isFiltered ? 'No events match these filters' : 'No upcoming events'
          }
          emptyMessage={
            cityName
              ? 'Try fewer filters, a wider distance or another city.'
              : 'Try fewer filters, or check back soon.'
          }
          emptyAction={
            isFiltered ? (
              <Button
                variant="secondary"
                onClick={() =>
                  update({ ...DEFAULT_FILTERS, sort: filters.sort })
                }
              >
                Clear filters
              </Button>
            ) : undefined
          }
        >
          <EventGrid
            events={events}
            canManage={(event) =>
              user?.role === 'ADMIN' || event.organizerId === user?.id
            }
          />
          <Pager
            total={data?.total ?? 0}
            offset={(filters.page - 1) * PAGE_SIZE}
            pageSize={PAGE_SIZE}
            label="events"
            onOffsetChange={(offset) => {
              update({ page: offset / PAGE_SIZE + 1 });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </StateView>
      </Results>
      <Modal
        open={drawerOpen}
        title="Filters"
        hideTitle
        onClose={() => setDrawerOpen(false)}
      >
        <DrawerBody>
          {panel}
          <Button fullWidth onClick={() => setDrawerOpen(false)}>
            {data ? `Show ${data.total} events` : 'Show events'}
          </Button>
        </DrawerBody>
      </Modal>
    </DiscoverLayout>
  );
};
