#!/usr/bin/env bash
# End-to-end check of a running Docker stack (`npm run docker:up` first).
# Uses only curl, grep and sed, so it runs on a laptop and in CI alike.
#   BASE_URL=http://localhost:8080 bash scripts/docker-smoke.sh
set -euo pipefail

BASE_URL=${BASE_URL:-http://localhost:${WEB_PORT:-8080}}
PASSWORD='Password123!'
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
failures=0

step() { printf '  %-62s' "$1"; }
ok() { echo 'ok'; }
fail() {
  echo "FAILED ($1)"
  failures=$((failures + 1))
}

# Status code of a request; extra curl arguments are passed through.
status() { curl -s -o "$work/body" -D "$work/headers" -w "%{http_code}" "$@" || true; }

login() {
  status -c "$work/$1.jar" -H 'Content-Type: application/json' \
    -d "{\"email\":\"$1\",\"password\":\"$PASSWORD\"}" "$BASE_URL/api/auth/login"
}

echo "Smoke-testing $BASE_URL"

step 'web: health check'
[ "$(status "$BASE_URL/healthz")" = 200 ] && ok || fail "not 200"

step 'web: app shell with security headers'
code=$(status "$BASE_URL/")
if [ "$code" = 200 ] && grep -q 'id="root"' "$work/body" &&
  grep -qi '^content-security-policy:' "$work/headers"; then ok; else fail "status $code"; fi

step 'web: deep link falls back to the app (/events/<slug>)'
code=$(status "$BASE_URL/events/react-chennai-meetup")
[ "$code" = 200 ] && grep -q 'id="root"' "$work/body" && ok || fail "status $code"

step 'api: health (database reachable)'
code=$(status "$BASE_URL/api/health")
[ "$code" = 200 ] && grep -q '"ok"' "$work/body" && ok || fail "status $code"

step 'api: published events are listed (demo data seeded)'
code=$(status "$BASE_URL/api/events")
[ "$code" = 200 ] && grep -q '"items":\[{' "$work/body" && ok || fail "status $code"

step 'api: anonymous user cannot create an event (401)'
code=$(status -H 'Content-Type: application/json' -d '{}' "$BASE_URL/api/events")
[ "$code" = 401 ] && ok || fail "status $code"

step 'auth: attendee signs in, httpOnly session cookie'
code=$(login attendee@example.com)
if [ "$code" = 200 ] && grep -qi '^set-cookie: em_session=.*httponly' "$work/headers"; then ok; else fail "status $code"; fi

step 'auth: attendee sees own registrations'
code=$(status -b "$work/attendee@example.com.jar" "$BASE_URL/api/me/registrations")
[ "$code" = 200 ] && ok || fail "status $code"

step 'auth: attendee cannot create an event (403)'
code=$(status -b "$work/attendee@example.com.jar" -H 'Content-Type: application/json' \
  -d '{}' "$BASE_URL/api/events")
[ "$code" = 403 ] && ok || fail "status $code"

step "ownership: organizer2 can't read organizer's attendees (404)"
status "$BASE_URL/api/events/postgresql-internals-workshop" >/dev/null
event_id=$(sed -n 's/^{"data":{"id":"\([0-9a-f-]*\)".*/\1/p' "$work/body")
login organizer2@example.com >/dev/null
code=$(status -b "$work/organizer2@example.com.jar" \
  "$BASE_URL/api/organizer/events/$event_id/attendees")
[ -n "$event_id" ] && [ "$code" = 404 ] && ok || fail "status $code, event '$event_id'"

if [ "$failures" -gt 0 ]; then
  echo "$failures check(s) failed. Logs: docker compose logs api web"
  exit 1
fi
echo 'All checks passed.'
