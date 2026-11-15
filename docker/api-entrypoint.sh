#!/bin/sh
# Starts the API container: migrate, optionally seed demo data, then `exec`
# the server so Node replaces this shell. `docker stop` then reaches Node
# directly and the graceful shutdown in server.ts runs.
set -eu

# No JWT_SECRET given: generate one on first start and keep it in a volume,
# so sessions survive restarts and no secret is ever committed.
if [ -z "${JWT_SECRET:-}" ]; then
  secret_file=/app/secrets/jwt-secret
  if [ ! -s "$secret_file" ]; then
    node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))" > "$secret_file"
    chmod 600 "$secret_file"
    echo "Generated a random JWT_SECRET in the api-secrets volume."
  fi
  JWT_SECRET=$(cat "$secret_file")
  export JWT_SECRET
fi

node dist/db/migrate.js

if [ "${SEED_DEMO_DATA:-false}" = "true" ]; then
  node dist/db/seed.js --if-empty
fi

exec node dist/server.js
