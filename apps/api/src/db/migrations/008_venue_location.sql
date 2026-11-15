-- Map pin for the venue of an in-person or hybrid event. Both coordinates
-- are set together or not at all. Publishing an in-person or hybrid event
-- needs a pin; that rule lives in the service (and the publish statement),
-- not here, so events created before this migration stay valid.

ALTER TABLE events
  ADD COLUMN venue_latitude double precision
    CHECK (venue_latitude BETWEEN -90 AND 90),
  ADD COLUMN venue_longitude double precision
    CHECK (venue_longitude BETWEEN -180 AND 180),
  ADD CONSTRAINT events_venue_location_pair
    CHECK ((venue_latitude IS NULL) = (venue_longitude IS NULL));
