#!/bin/sh
# Container entrypoint — runs Prisma migrations (idempotent) then hands off
# to the Next.js standalone server. Designed to run as the non-root `nextjs`
# user (defined in the Dockerfile runner stage).
#
# The auto-migrate keeps EasyPanel "click to redeploy" workflows safe: any
# new migration in prisma/migrations/ is applied before the new build starts
# serving traffic.

set -e

if [ -z "$DATABASE_URL" ]; then
  echo "[entrypoint] FATAL: DATABASE_URL is not set." >&2
  exit 1
fi

echo "[entrypoint] Running 'prisma migrate deploy'..."
# Call the Prisma CLI from the isolated /app/prisma-cli install. NODE_PATH
# lets the CLI resolve its own deps (effect, tsx, dotenv) from that tree.
NODE_PATH=/app/prisma-cli/node_modules \
  node /app/prisma-cli/node_modules/prisma/build/index.js migrate deploy

echo "[entrypoint] Migrations applied. Starting Next.js server on :${PORT:-3000}."
exec node server.js
