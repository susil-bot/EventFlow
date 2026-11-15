-- Richer events: type, category, slug, meeting link, social links,
-- promo images and time slots (sessions) with their own capacity.

ALTER TABLE events
  ADD COLUMN event_type   text  NOT NULL DEFAULT 'IN_PERSON'
    CHECK (event_type IN ('IN_PERSON', 'ONLINE', 'HYBRID')),
  ADD COLUMN category     text  NOT NULL DEFAULT 'OTHER'
    CHECK (category IN ('CONFERENCE', 'MEETUP', 'WORKSHOP', 'WEBINAR',
                        'NETWORKING', 'HACKATHON', 'OTHER')),
  ADD COLUMN slug         text,
  ADD COLUMN online_url   text,
  ADD COLUMN social_links jsonb NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(social_links) = 'array');

-- Existing rows get a slug from their title plus a short id suffix, which
-- is unique because the id is.
UPDATE events
   SET slug = coalesce(
         nullif(trim(BOTH '-' FROM
           left(regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'), 60)), ''),
         'event') || '-' || left(id::text, 8);

-- Rows inserted without a slug (raw SQL, scripts) get a random one; the
-- app always sets a readable slug itself.
ALTER TABLE events
  ALTER COLUMN slug SET NOT NULL,
  ALTER COLUMN slug SET DEFAULT
    'event-' || replace(gen_random_uuid()::text, '-', ''),
  ADD CONSTRAINT events_slug_format
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(slug) BETWEEN 3 AND 80);

CREATE UNIQUE INDEX events_slug_unique ON events (slug);

-- Uploaded files. Images are uploaded before the event is saved, so they
-- belong to the organizer first and are attached to an event on save.
CREATE TABLE uploads (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  file_name  text NOT NULL UNIQUE,
  mime_type  text NOT NULL
    CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes integer NOT NULL CHECK (size_bytes > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX uploads_owner_idx ON uploads (owner_id);

-- Ordered promo images; position 0 is the cover.
CREATE TABLE event_images (
  event_id  uuid    NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  upload_id uuid    NOT NULL REFERENCES uploads (id) ON DELETE CASCADE,
  position  integer NOT NULL CHECK (position >= 0),
  PRIMARY KEY (event_id, position),
  UNIQUE (event_id, upload_id)
);

-- Time slots. When an event has slots, events.capacity is the sum of slot
-- capacities and events.starts_at is the earliest slot start, so the
-- event-level guard in tryReservePlace still holds. Each slot also guards
-- its own capacity with the same conditional-UPDATE pattern.
CREATE TABLE event_slots (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id         uuid NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  label            text NOT NULL CHECK (length(trim(label)) > 0),
  starts_at        timestamptz NOT NULL,
  ends_at          timestamptz NOT NULL,
  capacity         integer NOT NULL CHECK (capacity > 0),
  registered_count integer NOT NULL DEFAULT 0,
  CONSTRAINT event_slots_ends_after_start CHECK (ends_at > starts_at),
  CONSTRAINT event_slots_registered_count_within_capacity
    CHECK (registered_count >= 0 AND registered_count <= capacity),
  UNIQUE (event_id, starts_at)
);

CREATE INDEX event_slots_event_idx ON event_slots (event_id, starts_at);

-- The attendee's chosen slot (required when the event has slots). The
-- partial unique index on registrations still allows one ACTIVE
-- registration per attendee per event, i.e. one slot per event.
ALTER TABLE registrations
  ADD COLUMN slot_id uuid REFERENCES event_slots (id) ON DELETE RESTRICT;

CREATE INDEX registrations_slot_idx ON registrations (slot_id)
  WHERE status = 'ACTIVE';
