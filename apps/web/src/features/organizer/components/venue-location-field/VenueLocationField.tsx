import React, { type KeyboardEvent, useId, useState } from 'react';
import { type PlaceResult, searchPlaces } from '@/shared/api/geocoding';
import type { VenueLocation } from '@/shared/api/types';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { TextField } from '@/shared/ui/text-field';
import { VenueMap } from '@/shared/ui/venue-map';
import {
  FieldError,
  FieldHint,
  FieldTitle,
  Note,
  PinRow,
  ResultButton,
  ResultList,
  SearchRow,
  StyledVenueLocationField
} from './styles';
import { type PlaceSearch, usePlaceSearch } from './use-place-search';

export type VenueLocationFieldProps = {
  value: VenueLocation | null;
  onChange: (value: VenueLocation | null) => void;
  /** Starting text for the search, e.g. the venue and city. */
  suggestedQuery: string;
  /** Map centre while there is no pin, e.g. the event's city. */
  center?: VenueLocation | null;
  error?: string;
  /** Shows the required marker (a pin is needed to publish). */
  required?: boolean;
  /** Address search; OpenStreetMap Nominatim by default. */
  search?: PlaceSearch;
};

const formatPin = ({ latitude, longitude }: VenueLocation) =>
  `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

/**
 * Venue map pin for the event form: search for the address, pick a match,
 * then drag the pin (or click the map) to fine-tune. Searching is an
 * explicit action (button or Enter), never search-as-you-type.
 */
export const VenueLocationField = ({
  value,
  onChange,
  suggestedQuery,
  center = null,
  error,
  required = false,
  search = searchPlaces
}: VenueLocationFieldProps) => {
  const id = useId();
  // Follows the venue name until the organizer types their own query.
  const [typedQuery, setTypedQuery] = useState<string | null>(null);
  const query = typedQuery ?? suggestedQuery;
  const places = usePlaceSearch(search);
  const { state } = places;

  const pick = (place: PlaceResult) => {
    onChange(place.location);
    places.reset();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // Enter searches instead of submitting the event form.
    if (event.key === 'Enter') {
      event.preventDefault();
      void places.run(query);
    }
  };

  return (
    <StyledVenueLocationField
      role="group"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-hint`}
    >
      <FieldTitle id={`${id}-title`}>
        Map pin
        {required ? <span aria-hidden="true"> *</span> : null}
      </FieldTitle>
      <FieldHint id={`${id}-hint`}>
        Search for the venue, then drag the pin or click the map to put it on
        the entrance. Needed to publish an in-person or hybrid event.
      </FieldHint>
      <SearchRow>
        <TextField
          label="Search for the address"
          type="search"
          value={query}
          onChange={(event) => setTypedQuery(event.target.value)}
          onKeyDown={onKeyDown}
          maxLength={200}
        />
        <Button
          variant="secondary"
          onClick={() => void places.run(query)}
          isLoading={state.status === 'loading'}
          disabled={query.trim().length < 3}
        >
          <Icon name="search" size={16} /> Find
        </Button>
      </SearchRow>

      {state.status === 'done' && state.results.length > 0 ? (
        <ResultList aria-label="Matching places">
          {state.results.map((place) => (
            <li key={place.id}>
              <ResultButton type="button" onClick={() => pick(place)}>
                <Icon name="pin" size={16} />
                <span>{place.label}</span>
              </ResultButton>
            </li>
          ))}
        </ResultList>
      ) : null}
      <div role="status">
        {state.status === 'done' && state.results.length === 0 ? (
          <Note>
            No places found. Try a shorter address, or click the map to drop the
            pin.
          </Note>
        ) : null}
        {state.status === 'error' ? (
          <Note>
            Address search isn&apos;t available right now. Click the map to drop
            the pin instead.
          </Note>
        ) : null}
      </div>

      <VenueMap
        location={value}
        center={center}
        onChange={onChange}
        label="Venue map. Click to drop the pin, or drag it."
        height={300}
      />
      <PinRow>
        <span>
          {value ? `Pinned at ${formatPin(value)}` : 'No pin placed yet.'}
        </span>
        {value ? (
          <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
            Remove pin
          </Button>
        ) : null}
      </PinRow>
      {error ? <FieldError role="alert">{error}</FieldError> : null}
    </StyledVenueLocationField>
  );
};
