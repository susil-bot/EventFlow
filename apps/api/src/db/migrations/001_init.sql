-- Users, events and registrations for the event management MVP.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('ORGANIZER', 'ATTENDEE');
CREATE TYPE event_status AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELED');
CREATE TYPE registration_status AS ENUM ('ACTIVE', 'CANCELED');

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL CHECK (length(trim(name)) > 0),
  email         text NOT NULL,
  password_hash text NOT NULL,
  role          user_role NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Emails are compared case-insensitively.
CREATE UNIQUE INDEX users_email_unique ON users (lower(email));

CREATE TABLE events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id     uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  title            text NOT NULL CHECK (length(trim(title)) > 0),
  description      text NOT NULL CHECK (length(trim(description)) > 0),
  starts_at        timestamptz NOT NULL,
  time_zone        text NOT NULL,
  venue            text NOT NULL CHECK (length(trim(venue)) > 0),
  capacity         integer NOT NULL CHECK (capacity > 0),
  -- Denormalised count of ACTIVE registrations. Kept in sync inside the
  -- same transaction as every registration change and used as the atomic
  -- capacity guard.
  registered_count integer NOT NULL DEFAULT 0,
  status           event_status NOT NULL DEFAULT 'DRAFT',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT events_registered_count_within_capacity
    CHECK (registered_count >= 0 AND registered_count <= capacity)
);

CREATE INDEX events_organizer_idx ON events (organizer_id, starts_at);
CREATE INDEX events_public_listing_idx ON events (status, starts_at);

CREATE TABLE registrations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    uuid NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  attendee_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status      registration_status NOT NULL DEFAULT 'ACTIVE',
  created_at  timestamptz NOT NULL DEFAULT now(),
  canceled_at timestamptz,
  CONSTRAINT registrations_canceled_at_matches_status
    CHECK ((status = 'CANCELED') = (canceled_at IS NOT NULL))
);

-- One ACTIVE registration per attendee per event. Canceled rows are kept
-- for history and do not block re-registering.
CREATE UNIQUE INDEX registrations_one_active_per_attendee
  ON registrations (event_id, attendee_id)
  WHERE status = 'ACTIVE';

CREATE INDEX registrations_attendee_idx ON registrations (attendee_id, status);
CREATE INDEX registrations_event_idx ON registrations (event_id, status);
