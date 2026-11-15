-- Location: supported cities (reference data), the city an event happens
-- in, and a user's saved home city.

CREATE TABLE cities (
  id           text PRIMARY KEY CHECK (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name         text NOT NULL UNIQUE,
  state        text NOT NULL,
  country_code char(2) NOT NULL DEFAULT 'IN',
  latitude     double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude    double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  time_zone    text NOT NULL,
  -- Other names people search for ("Bombay", "Madras", "Gurugram").
  aliases      text[] NOT NULL DEFAULT '{}',
  is_popular   boolean NOT NULL DEFAULT false,
  sort_order   integer NOT NULL DEFAULT 100
);

-- Reference data lives in the migration so every environment (including
-- tests) has the same cities. Coordinates are city centres.
INSERT INTO cities (id, name, state, latitude, longitude, time_zone, aliases, is_popular, sort_order) VALUES
  ('mumbai',     'Mumbai',     'Maharashtra', 19.0760, 72.8777, 'Asia/Kolkata', '{Bombay,Navi Mumbai,Thane}',               true, 1),
  ('delhi-ncr',  'Delhi-NCR',  'Delhi',       28.6139, 77.2090, 'Asia/Kolkata', '{Delhi,New Delhi,Gurugram,Gurgaon,Noida}', true, 2),
  ('bengaluru',  'Bengaluru',  'Karnataka',   12.9716, 77.5946, 'Asia/Kolkata', '{Bangalore}',                              true, 3),
  ('hyderabad',  'Hyderabad',  'Telangana',   17.3850, 78.4867, 'Asia/Kolkata', '{Secunderabad,Cyberabad}',                 true, 4),
  ('chandigarh', 'Chandigarh', 'Chandigarh',  30.7333, 76.7794, 'Asia/Kolkata', '{Mohali,Panchkula,Tricity}',               true, 5),
  ('ahmedabad',  'Ahmedabad',  'Gujarat',     23.0225, 72.5714, 'Asia/Kolkata', '{Amdavad,Gandhinagar}',                    true, 6),
  ('pune',       'Pune',       'Maharashtra', 18.5204, 73.8567, 'Asia/Kolkata', '{Poona,Pimpri-Chinchwad}',                 true, 7),
  ('chennai',    'Chennai',    'Tamil Nadu',  13.0827, 80.2707, 'Asia/Kolkata', '{Madras}',                                 true, 8),
  ('kolkata',    'Kolkata',    'West Bengal', 22.5726, 88.3639, 'Asia/Kolkata', '{Calcutta,Howrah}',                        true, 9),
  ('kochi',      'Kochi',      'Kerala',       9.9312, 76.2673, 'Asia/Kolkata', '{Cochin,Ernakulam}',                       true, 10);

-- Great-circle distance in km (haversine). Accurate to well under 1% at
-- city scale, which is all the app needs; switch to PostGIS if events get
-- precise coordinates and volumes grow.
CREATE FUNCTION distance_km(
  lat1 double precision, lon1 double precision,
  lat2 double precision, lon2 double precision
) RETURNS double precision
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE AS $$
  SELECT 6371 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) *
    power(sin(radians(lon2 - lon1) / 2), 2)
  ))
$$;

ALTER TABLE events
  ADD COLUMN city_id text REFERENCES cities (id) ON DELETE RESTRICT;

CREATE INDEX events_city_upcoming_idx ON events (city_id, starts_at)
  WHERE status = 'PUBLISHED';

-- Best-effort backfill from the free-text venue ("Tidel Park, Chennai").
UPDATE events e
   SET city_id = c.id
  FROM cities c
 WHERE e.city_id IS NULL
   AND e.event_type <> 'ONLINE'
   AND (e.venue ILIKE '%' || c.name || '%'
        OR EXISTS (SELECT 1 FROM unnest(c.aliases) a
                    WHERE e.venue ILIKE '%' || a || '%'));

-- In-person and hybrid events need a city. NOT VALID: enforced for every
-- new or changed row without failing on older events the backfill could not
-- place (an organizer sets the city the next time they edit them).
ALTER TABLE events
  ADD CONSTRAINT events_city_required
  CHECK (event_type = 'ONLINE' OR city_id IS NOT NULL) NOT VALID;

ALTER TABLE users
  ADD COLUMN home_city_id text REFERENCES cities (id) ON DELETE SET NULL;
