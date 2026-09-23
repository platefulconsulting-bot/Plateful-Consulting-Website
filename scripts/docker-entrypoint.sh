#!/bin/sh
# ---------------------------------------------------------------------------
# Container start-up.
#
# Everything here is safe to run on every boot — nothing destructive, and the
# live database is never overwritten once it exists.
# ---------------------------------------------------------------------------
set -e

DB_FILE="/app/data/prod.db"

mkdir -p /app/data /app/storage/uploads

# First boot on an empty volume: install the content baked into the image so
# the site comes up complete, with all 32 articles already in place. If a
# database is already on the volume, this is skipped — your live content and
# any articles written in the Studio are never touched.
if [ ! -f "$DB_FILE" ]; then
  echo "[boot] no database on the volume — installing the seeded copy"
  cp /app/seed/prod.db "$DB_FILE"
else
  echo "[boot] existing database found — leaving it alone"
fi

# Adds any tables introduced by an update. No-op when nothing has changed.
echo "[boot] applying database schema"
npx prisma db push --skip-generate

# Applies STUDIO_EMAIL / STUDIO_PASSWORD from the environment, so changing the
# Studio password is: edit .env, restart. Never touches articles.
echo "[boot] ensuring Studio login"
npx tsx prisma/ensure-admin.ts

echo "[boot] starting Next.js"
exec npx next start -H 0.0.0.0 -p "${PORT:-3000}"
