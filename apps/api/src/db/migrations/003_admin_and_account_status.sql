-- Admin role, account status (organizer approval, suspension) and an audit
-- log of admin actions.

-- PostgreSQL 12+ allows this inside a transaction as long as the new value
-- is not used in the same transaction (it isn't, below).
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'ADMIN';

CREATE TYPE account_status AS ENUM ('ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED');

-- Existing accounts stay ACTIVE. New organizers start PENDING_APPROVAL
-- (set by the application at sign-up).
ALTER TABLE users
  ADD COLUMN status            account_status NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN status_changed_at timestamptz;

CREATE INDEX users_role_status_idx ON users (role, status);

-- Shown to attendees when an admin (or organizer) cancels with a reason.
ALTER TABLE events
  ADD COLUMN cancellation_reason text
    CHECK (cancellation_reason IS NULL OR length(trim(cancellation_reason)) > 0);

-- Append-only record of every admin action, written in the same
-- transaction as the change it describes.
CREATE TABLE admin_audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  action      text NOT NULL CHECK (action IN (
                'APPROVE_ORGANIZER', 'SUSPEND_USER', 'REACTIVATE_USER',
                'CHANGE_ROLE', 'CANCEL_EVENT')),
  target_type text NOT NULL CHECK (target_type IN ('USER', 'EVENT')),
  target_id   uuid NOT NULL,
  reason      text,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX admin_audit_log_created_idx ON admin_audit_log (created_at DESC);
CREATE INDEX admin_audit_log_target_idx ON admin_audit_log (target_type, target_id);
