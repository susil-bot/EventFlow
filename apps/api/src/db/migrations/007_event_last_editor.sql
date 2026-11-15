-- Who last changed an event (the organizer, or an admin moderating it), for
-- the "Last modified … by …" line in the editor. Registrations don't count
-- as edits. Existing events are attributed to their organizer.

ALTER TABLE events
  ADD COLUMN updated_by uuid REFERENCES users (id) ON DELETE SET NULL;

UPDATE events SET updated_by = organizer_id WHERE updated_by IS NULL;
