/**
 * Event columns plus its images and slots aggregated as JSON, so every
 * event query returns the full event in one round trip. Expects `events e`
 * joined to the organizer as `users u`.
 */
export const EVENT_COLUMNS = `
  e.id, e.organizer_id, u.name AS organizer_name, e.title, e.description,
  e.starts_at, e.time_zone, e.venue, e.capacity, e.registered_count,
  e.status, e.event_type, e.category, e.slug, e.online_url, e.social_links,
  e.cancellation_reason, e.price_minor, e.currency, e.publish_at,
  e.expires_at, e.venue_latitude, e.venue_longitude, e.created_at,
  e.updated_at,
  (SELECT json_build_object('id', ci.id, 'name', ci.name)
     FROM cities ci WHERE ci.id = e.city_id) AS city,
  (SELECT json_build_object('id', ed.id, 'name', ed.name)
     FROM users ed WHERE ed.id = e.updated_by) AS updated_by_user,
  COALESCE((
    SELECT json_agg(json_build_object('id', up.id, 'fileName', up.file_name)
                    ORDER BY ei.position)
      FROM event_images ei
      JOIN uploads up ON up.id = ei.upload_id
     WHERE ei.event_id = e.id
  ), '[]'::json) AS images,
  COALESCE((
    SELECT json_agg(json_build_object(
             'id', s.id, 'label', s.label, 'startsAt', s.starts_at,
             'endsAt', s.ends_at, 'capacity', s.capacity,
             'registeredCount', s.registered_count)
           ORDER BY s.starts_at)
      FROM event_slots s
     WHERE s.event_id = e.id
  ), '[]'::json) AS slots
`;

/**
 * SQL condition for a *live* event: published, past its go-live time, not
 * expired and not started. Used by discovery, counts and the registration
 * guard so they always agree.
 */
export const liveCondition = (alias = 'e') => `
  ${alias}.status = 'PUBLISHED'
  AND (${alias}.publish_at IS NULL OR ${alias}.publish_at <= now())
  AND (${alias}.expires_at IS NULL OR ${alias}.expires_at > now())
  AND ${alias}.starts_at > now()`;

export const FROM_EVENTS =
  'FROM events e JOIN users u ON u.id = e.organizer_id';
