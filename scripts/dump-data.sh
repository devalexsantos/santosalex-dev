#!/usr/bin/env bash
#
# Dumps DATA ONLY from the local Postgres so it can be restored into a fresh
# production database whose schema was already created by `prisma migrate
# deploy` (the app runs that on first boot — see docker-entrypoint.sh).
#
# Why data-only:
#   - The production schema (tables + the `vector` extension) is owned by
#     Prisma migrations, so we must NOT dump/restore the schema again.
#   - `_prisma_migrations` is excluded: production already records the applied
#     migrations, and restoring its rows would cause primary-key conflicts.
#
# It runs pg_dump *inside* the compose container so the client version always
# matches the server (pg17 / pgvector). Override with env vars if needed.
#
# Usage:
#   ./scripts/dump-data.sh                 # uses the compose container
#   PG_CONTAINER=my-pg ./scripts/dump-data.sh
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

CONTAINER="${PG_CONTAINER:-santosalex-postgres}"
DB_USER="${PG_USER:-portfolio}"
DB_NAME="${PG_DB:-portfolio}"
OUT="${OUT_FILE:-$ROOT_DIR/portfolio_data_$(date +%Y%m%d_%H%M%S).sql}"

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "ERROR: container '$CONTAINER' is not running." >&2
  echo "Start it with 'npm run db:up' or set PG_CONTAINER to the right name." >&2
  exit 1
fi

echo "Dumping data-only from container '$CONTAINER' (db=$DB_NAME) -> $OUT"

docker exec "$CONTAINER" pg_dump \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --data-only \
  --no-owner \
  --no-privileges \
  --disable-triggers \
  --exclude-table-data='_prisma_migrations' \
  > "$OUT"

BYTES=$(wc -c < "$OUT" | tr -d ' ')
echo "Done — wrote $BYTES bytes to $OUT"
echo
echo "Restore into production (after the app booted once and ran migrations):"
echo "  psql \"<PROD_DATABASE_URL>\" -f \"$OUT\""
