-- Broader event categories (existing values are kept, so no data changes)
-- and a ticket price. Price is stored in minor units (paise for INR) to
-- avoid floating-point money; 0 means free. Payment is out of scope: the
-- price is shown to attendees, registration itself stays the same.

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_category_check;
ALTER TABLE events
  ADD CONSTRAINT events_category_check CHECK (category IN (
    'WORKSHOP', 'MUSIC_SHOW', 'COMEDY_SHOW', 'PERFORMANCE', 'KIDS',
    'CONFERENCE', 'MEETUP', 'EXHIBITION', 'SCREENING', 'PARTY',
    'NETWORKING', 'HACKATHON', 'WEBINAR', 'OTHER'
  ));

ALTER TABLE events
  ADD COLUMN price_minor integer NOT NULL DEFAULT 0
    CHECK (price_minor BETWEEN 0 AND 10000000),
  ADD COLUMN currency    char(3) NOT NULL DEFAULT 'INR'
    CHECK (currency = 'INR');

-- Discovery filters by city, category and price on upcoming published events.
CREATE INDEX events_discovery_idx
  ON events (status, category, starts_at)
  WHERE status = 'PUBLISHED';
