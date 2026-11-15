#!/usr/bin/env bash
# One-command local setup + verification (macOS/Linux, bash 3.2 compatible).
#   T03  validate environment config
#   T04  find/start PostgreSQL, create databases, migrate, seed
#   T05  start API + web, check health, public API and UI, keep running
# Usage: npm run setup:local   (Ctrl+C stops the dev servers)
set -u
cd "$(dirname "$0")/.."
ROOT=$(pwd)
LOG="$ROOT/logs/setup-local.log"
mkdir -p "$ROOT/logs"
: > "$LOG"

log() { printf '%s\n' "$*" | tee -a "$LOG"; }
pass() { log "  ✅ $*"; }
fail() { log "  ❌ $*"; log "RESULT: FAILED"; exit 1; }
run() { "$@" >>"$LOG" 2>&1; }

ENV_FILE="$ROOT/apps/api/.env"
set_env() { # set_env KEY VALUE  (portable in-place edit)
  KEY="$1" VALUE="$2" perl -pi -e 's/^\Q$ENV{KEY}\E=.*/$ENV{KEY}=$ENV{VALUE}/' "$ENV_FILE"
}

log "== Local setup $(date) =="
log "node $(node -v), npm $(npm -v)"

# ---------------------------------------------------------------- T03
log ""
log "T03 – environment variables"
[ -f "$ENV_FILE" ] || cp "$ROOT/apps/api/.env.example" "$ENV_FILE"
[ -f "$ROOT/apps/web/.env" ] || cp "$ROOT/apps/web/.env.example" "$ROOT/apps/web/.env"
if grep -q '^JWT_SECRET=change-me' "$ENV_FILE"; then
  set_env JWT_SECRET "$(openssl rand -hex 32)"
  log "  generated a random JWT_SECRET"
fi

check_config() {
  (cd "$ROOT/apps/api" && npx tsx -e "
    const { config } = require('./src/config');
    console.log(JSON.stringify({ env: config.env, port: config.port,
      db: config.databaseUrl.replace(/:[^:@/]*@/, ':***@'),
      jwtSecretLength: config.jwtSecret.length }));
  " 2>&1)
}
CONFIG_OUT=$(check_config) || fail "config invalid: $CONFIG_OUT"
pass "config valid $CONFIG_OUT"

# ---------------------------------------------------------------- T04
log ""
log "T04 – PostgreSQL"
db_url() { grep "^$1=" "$ENV_FILE" | cut -d= -f2-; }
can_connect() { psql "$1" -Atqc 'SELECT 1' >/dev/null 2>&1; }

if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
  log "  PostgreSQL is already running on localhost:5432"
elif docker info >/dev/null 2>&1; then
  log "  starting PostgreSQL with Docker (npm run db:up)"
  run npm run db:up || fail "docker compose up failed (see log)"
else
  BREW_PG=$(brew services list 2>/dev/null | awk '/^postgresql/ {print $1; exit}')
  [ -n "$BREW_PG" ] || fail "no PostgreSQL running, Docker not running, no Homebrew postgresql service"
  log "  starting Homebrew service $BREW_PG"
  run brew services start "$BREW_PG" || fail "could not start $BREW_PG"
fi

for _ in $(seq 1 30); do pg_isready -h localhost -p 5432 >/dev/null 2>&1 && break; sleep 1; done
pg_isready -h localhost -p 5432 >/dev/null 2>&1 || fail "PostgreSQL did not become ready"
pass "PostgreSQL ready on localhost:5432"

DEV_URL=$(db_url DATABASE_URL)
TEST_URL=$(db_url TEST_DATABASE_URL)
ADMIN_URL="${DEV_URL%/*}/postgres"
if ! can_connect "$ADMIN_URL"; then
  # Homebrew/Postgres.app use the macOS user without a password.
  ALT_ADMIN="postgres://$(whoami)@localhost:5432/postgres"
  can_connect "$ALT_ADMIN" || fail "cannot connect as postgres or $(whoami)"
  log "  'postgres' role unavailable; using local user $(whoami)"
  DEV_URL="postgres://$(whoami)@localhost:5432/events_dev"
  TEST_URL="postgres://$(whoami)@localhost:5432/events_test"
  ADMIN_URL="$ALT_ADMIN"
  set_env DATABASE_URL "$DEV_URL"
  set_env TEST_DATABASE_URL "$TEST_URL"
fi
for DB in events_dev events_test; do
  EXISTS=$(psql "$ADMIN_URL" -Atqc "SELECT 1 FROM pg_database WHERE datname = '$DB'")
  if [ "$EXISTS" != "1" ]; then
    run psql "$ADMIN_URL" -qc "CREATE DATABASE $DB" || fail "could not create $DB"
    log "  created database $DB"
  fi
done
can_connect "$DEV_URL" || fail "cannot connect to events_dev"
pass "connected to events_dev and events_test"

run npm run db:migrate || fail "migration failed (see log)"
pass "migrations applied"
run npm run db:seed || fail "seed failed (see log)"
USERS=$(psql "$DEV_URL" -Atqc 'SELECT count(*) FROM users')
EVENTS=$(psql "$DEV_URL" -Atqc 'SELECT count(*) FROM events')
pass "seeded $USERS users and $EVENTS events"

# ---------------------------------------------------------------- T05
log ""
log "T05 – run frontend and backend"
for PORT in 4000 5173; do
  PID=$(lsof -ti tcp:$PORT -sTCP:LISTEN 2>/dev/null)
  [ -z "$PID" ] || fail "port $PORT is already in use (pid $PID); stop it and rerun"
done
npm run dev >"$ROOT/logs/dev-servers.log" 2>&1 &
DEV_PID=$!
trap 'kill $DEV_PID 2>/dev/null; pkill -P $DEV_PID 2>/dev/null' EXIT INT TERM

wait_for() { for _ in $(seq 1 60); do curl -fsS "$1" >/dev/null 2>&1 && return 0; sleep 1; done; return 1; }
wait_for http://localhost:4000/api/health || fail "API did not start (see logs/dev-servers.log)"
pass "API health: $(curl -s http://localhost:4000/api/health)"
COUNT=$(curl -s http://localhost:4000/api/events | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).data.length))')
pass "public listing returns $COUNT published upcoming events"
wait_for http://localhost:5173 || fail "web app did not start (see logs/dev-servers.log)"
curl -s http://localhost:5173 | grep -q '<div id="root">' || fail "web index.html unexpected"
pass "web app serving http://localhost:5173"
PROXY=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:5173/api/health)
[ "$PROXY" = "200" ] || fail "web → API proxy returned $PROXY"
pass "web → API proxy works"

log ""
log "RESULT: ALL CHECKS PASSED"
log "Open http://localhost:5173  ·  demo password: Password123!"
log "Dev servers keep running here; press Ctrl+C to stop."
wait $DEV_PID
