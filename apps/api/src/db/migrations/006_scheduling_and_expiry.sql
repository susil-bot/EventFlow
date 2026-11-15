-- Scheduled publishing and listing expiry.
--
-- An event is *live* (listed in Discover and open for registration) when
--   status = 'PUBLISHED'
--   AND (publish_at IS NULL OR publish_at <= now())
--   AND (expires_at IS NULL OR expires_at > now())
--   AND starts_at > now()
-- so no background job is needed: going live and expiring happen by the
-- clock, checked in every query.

ALTER TABLE events
  ADD COLUMN publish_at timestamptz,
  ADD COLUMN expires_at timestamptz;

ALTER TABLE events
  ADD CONSTRAINT events_expiry_after_publish
    CHECK (expires_at IS NULL OR publish_at IS NULL OR expires_at > publish_at),
  ADD CONSTRAINT events_publish_before_start
    CHECK (publish_at IS NULL OR publish_at < starts_at),
  ADD CONSTRAINT events_expiry_not_after_start
    CHECK (expires_at IS NULL OR expires_at <= starts_at);

-- Admin edits and publishing decisions are audited like other admin actions.
ALTER TABLE admin_audit_log DROP CONSTRAINT admin_audit_log_action_check;
ALTER TABLE admin_audit_log
  ADD CONSTRAINT admin_audit_log_action_check CHECK (action IN (
    'APPROVE_ORGANIZER', 'SUSPEND_USER', 'REACTIVATE_USER', 'CHANGE_ROLE',
    'CANCEL_EVENT', 'EDIT_EVENT', 'PUBLISH_EVENT', 'UNPUBLISH_EVENT'));
