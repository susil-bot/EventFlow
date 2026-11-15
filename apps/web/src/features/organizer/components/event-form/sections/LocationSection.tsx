import React from 'react';
import type { City } from '@/shared/api/types';
import { SelectField } from '@/shared/ui/select-field';
import { TextField } from '@/shared/ui/text-field';
import { VenueLocationField } from '../../venue-location-field';
import { FormGrid, FormSection, FormSectionTitle } from '../styles';
import type { SectionProps } from '../types';

type LocationSectionProps = SectionProps & {
  /** Active registrations; capacity cannot go below this. */
  minCapacity: number;
  cities: City[];
};

/**
 * Where the event happens and who can come: city, venue and map pin (or
 * the meeting link), capacity and ticket price. Dates and times live in
 * `DateTimeSection`.
 */
export const LocationSection = ({
  values,
  errors,
  onText,
  setField,
  minCapacity,
  cities
}: LocationSectionProps) => {
  const { eventType } = values;
  const hasSlots = values.slots.length > 0;
  const cityOptions = [
    { value: '', label: 'Choose a city' },
    ...cities.map((city) => ({ value: city.id, label: city.name }))
  ];

  const city = cities.find((candidate) => candidate.id === values.cityId);
  const cityCenter = city
    ? { latitude: city.latitude, longitude: city.longitude }
    : null;
  // "WeWork Guindy, Chennai", without repeating a city the venue names.
  const venueText = values.venue.trim();
  const pinQuery =
    city && !venueText.toLowerCase().includes(city.name.toLowerCase())
      ? [venueText, city.name].filter(Boolean).join(', ')
      : venueText;

  // Picking a city also sets its time zone (still editable afterwards).
  const handleCity = (cityId: string) => {
    setField('cityId', cityId);
    const chosen = cities.find((candidate) => candidate.id === cityId);
    if (chosen) {
      setField('timeZone', chosen.timeZone);
    }
  };

  return (
    <FormSection>
      <FormSectionTitle>Location & tickets</FormSectionTitle>
      <FormGrid>
        {eventType === 'ONLINE' ? null : (
          <SelectField
            label="City"
            options={cityOptions}
            value={values.cityId}
            onChange={(event) => handleCity(event.target.value)}
            error={errors.cityId}
            hint="Lets attendees find the event by location, and sets the time zone."
            required
          />
        )}
        <TextField
          label="Venue or location"
          value={values.venue}
          onChange={onText('venue')}
          error={errors.venue}
          maxLength={200}
          hint={
            eventType === 'ONLINE' ? 'Optional for online events.' : undefined
          }
          required={eventType !== 'ONLINE'}
        />
      </FormGrid>
      {eventType === 'ONLINE' ? null : (
        <VenueLocationField
          value={values.venueLocation}
          onChange={(location) => setField('venueLocation', location)}
          suggestedQuery={pinQuery}
          center={cityCenter}
          error={
            errors.venueLocation ??
            errors['venueLocation.latitude'] ??
            errors['venueLocation.longitude']
          }
          required
        />
      )}
      <FormGrid>
        {hasSlots ? null : (
          <TextField
            label="Maximum capacity"
            type="number"
            inputMode="numeric"
            min={Math.max(minCapacity, 1)}
            step={1}
            value={values.capacity}
            onChange={onText('capacity')}
            error={errors.capacity}
            hint={
              minCapacity > 0
                ? `${minCapacity} people are registered; capacity can't go lower.`
                : undefined
            }
            required
          />
        )}
        <TextField
          label="Ticket price (₹)"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={values.price}
          onChange={onText('price')}
          error={errors.priceMinor}
          hint="0 for a free event. Shown to attendees; no payment is taken."
          required
        />
      </FormGrid>
      {eventType === 'IN_PERSON' ? null : (
        <TextField
          label="Meeting link"
          type="url"
          inputMode="url"
          placeholder="https://"
          value={values.onlineUrl}
          onChange={onText('onlineUrl')}
          error={errors.onlineUrl}
          hint="Only shown to the people who registered."
          maxLength={500}
          required
        />
      )}
    </FormSection>
  );
};
