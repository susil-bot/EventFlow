import React, {
  type KeyboardEvent,
  useId,
  useMemo,
  useRef,
  useState
} from 'react';
import type { City } from '@/shared/api/types';
import {
  type Coordinates,
  MAX_NEAREST_CITY_KM,
  nearestCity,
  searchCities
} from '../../utils/geo';
import { Icon } from '@/shared/ui/icon';
import { Modal } from '@/shared/ui/modal';
import { LocateError, locateWithBrowser } from './locate';
import {
  AllCitiesButton,
  CityBadge,
  CityGrid,
  CityList,
  CityListItem,
  CityTile,
  DetectButton,
  EmptyResult,
  ResultOption,
  ResultsList,
  SearchBox,
  SearchInput,
  SectionHeading,
  StatusMessage,
  ToggleLink
} from './styles';

export type CityPickerProps = {
  open: boolean;
  cities: City[];
  /** Currently selected city, or null for all cities. */
  selectedCityId: string | null;
  onSelect: (cityId: string | null) => void;
  onClose: () => void;
  /** Injected for tests; defaults to the browser's geolocation. */
  locate?: () => Promise<Coordinates>;
};

type DetectState =
  | { kind: 'idle' }
  | { kind: 'locating' }
  | { kind: 'error'; message: string };

const LOCATE_MESSAGES: Record<LocateError['reason'], string> = {
  denied:
    'Location access is blocked. Allow it in your browser settings, or choose your city below.',
  unavailable:
    "We couldn't find your location right now. Please pick your city below.",
  unsupported:
    "Your browser can't share its location. Please pick your city below."
};

const eventCount = (count: number) =>
  count === 0
    ? 'No upcoming events'
    : `${count} upcoming event${count === 1 ? '' : 's'}`;

/**
 * City chooser: search (by name, old name or state), "Detect my location",
 * popular cities and the full list. The detected position stays in the
 * browser; only the chosen city id is used.
 */
export const CityPicker = ({
  open,
  cities,
  selectedCityId,
  onSelect,
  onClose,
  locate = locateWithBrowser
}: CityPickerProps) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [detect, setDetect] = useState<DetectState>({ kind: 'idle' });
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const results = useMemo(
    () => (query.trim() ? searchCities(cities, query) : []),
    [cities, query]
  );
  const popular = cities.filter((city) => city.isPopular);
  const others = cities
    .filter((city) => !city.isPopular)
    .sort((a, b) => a.name.localeCompare(b.name));

  const choose = (cityId: string | null) => {
    onSelect(cityId);
    setQuery('');
    setDetect({ kind: 'idle' });
  };

  const handleDetect = () => {
    setDetect({ kind: 'locating' });
    locate()
      .then((position) => {
        const match = nearestCity(cities, position);
        if (match) {
          choose(match.city.id);
        } else {
          setDetect({
            kind: 'error',
            message: `We don't have events within ${MAX_NEAREST_CITY_KM} km of you yet. Choose the nearest city below.`
          });
        }
      })
      .catch((error: unknown) =>
        setDetect({
          kind: 'error',
          message:
            error instanceof LocateError
              ? LOCATE_MESSAGES[error.reason]
              : LOCATE_MESSAGES.unavailable
        })
      );
  };

  const handleSearchKeys = (event: KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) {
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const city = results[activeIndex];
      if (city) {
        choose(city.id);
      }
    }
  };

  const optionId = (index: number) => `${listId}-option-${index}`;
  const isSearching = query.trim() !== '';

  return (
    <Modal
      open={open}
      title="Choose your city"
      hideTitle
      onClose={onClose}
      initialFocusRef={searchRef}
    >
      <SearchBox>
        <Icon name="search" size={22} />
        <SearchInput
          ref={searchRef}
          type="search"
          role="combobox"
          aria-label="Search for your city"
          aria-expanded={isSearching}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            isSearching && results.length > 0
              ? optionId(activeIndex)
              : undefined
          }
          placeholder="Search for your city"
          autoComplete="off"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleSearchKeys}
        />
      </SearchBox>
      <DetectButton
        type="button"
        onClick={handleDetect}
        disabled={detect.kind === 'locating'}
      >
        <Icon name="locate" size={20} />
        {detect.kind === 'locating'
          ? 'Detecting your location…'
          : 'Detect my location'}
      </DetectButton>
      <StatusMessage role="status">
        {detect.kind === 'error' ? detect.message : ''}
      </StatusMessage>

      {isSearching ? (
        <ResultsList id={listId} role="listbox" aria-label="Matching cities">
          {results.length === 0 ? (
            <EmptyResult>
              No city matches “{query.trim()}”. Try another spelling or pick
              from the list.
            </EmptyResult>
          ) : (
            results.map((city, index) => (
              <ResultOption
                key={city.id}
                id={optionId(index)}
                role="option"
                aria-selected={index === activeIndex}
                $active={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(city.id)}
              >
                <strong>{city.name}</strong>
                <span>
                  {city.state} · {eventCount(city.upcomingEventCount)}
                </span>
              </ResultOption>
            ))
          )}
        </ResultsList>
      ) : (
        <>
          <SectionHeading>Popular cities</SectionHeading>
          <CityGrid>
            {popular.map((city) => (
              <li key={city.id}>
                <CityTile
                  type="button"
                  aria-pressed={city.id === selectedCityId}
                  $muted={city.upcomingEventCount === 0}
                  onClick={() => choose(city.id)}
                >
                  <CityBadge aria-hidden="true">
                    {city.name.charAt(0)}
                  </CityBadge>
                  <strong>{city.name}</strong>
                  <span>{eventCount(city.upcomingEventCount)}</span>
                </CityTile>
              </li>
            ))}
          </CityGrid>

          {others.length > 0 ? (
            <>
              {showAll ? (
                <>
                  <SectionHeading>Other cities</SectionHeading>
                  <CityList>
                    {others.map((city) => (
                      <li key={city.id}>
                        <CityListItem
                          type="button"
                          aria-pressed={city.id === selectedCityId}
                          onClick={() => choose(city.id)}
                        >
                          {city.name}
                        </CityListItem>
                      </li>
                    ))}
                  </CityList>
                </>
              ) : null}
              <ToggleLink
                type="button"
                aria-expanded={showAll}
                onClick={() => setShowAll((value) => !value)}
              >
                {showAll ? 'Hide all cities' : 'View all cities'}
              </ToggleLink>
            </>
          ) : null}

          <AllCitiesButton
            type="button"
            aria-pressed={selectedCityId === null}
            onClick={() => choose(null)}
          >
            Show events in all cities
          </AllCitiesButton>
        </>
      )}
    </Modal>
  );
};
