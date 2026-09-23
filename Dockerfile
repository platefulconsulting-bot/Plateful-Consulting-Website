# syntax=docker/dockerfile:1
# ---------------------------------------------------------------------------
# Plateful Consulting — production image
#
# Deliberately a straightforward image rather than a trimmed "standalone" one.
# This is a low-traffic marketing site on its own VPS; a simple image that is
# easy to reason about and debug over SSH is worth far more here than saving a
# few hundred megabytes.
# ---------------------------------------------------------------------------

FROM node:20-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
# openssl: required by Prisma. ca-certificates: outbound HTTPS (e.g. Resend).
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app


# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
FROM base AS build

# Schema is copied before install because `postinstall` runs `prisma generate`.
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so the
# public site URL has to be known here — not just at runtime.
ARG NEXT_PUBLIC_SITE_URL="https://platefulconsulting.com"
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# The site prerenders all 32 articles during the build, which means the build
# needs a populated database. One is created and seeded inside the image here;
# at runtime the real database lives on a mounted volume instead, and this copy
# is only used to populate that volume on the very first boot.
ENV DATABASE_URL="file:/app/seed/prod.db"
ENV STUDIO_EMAIL="build@local"
ENV STUDIO_PASSWORD="build-time-placeholder-replaced-on-first-boot"
RUN mkdir -p /app/seed \
 && npx prisma db push --skip-generate \
 && npx tsx prisma/seed.ts \
 && npm run build


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production

COPY --from=build /app /app
RUN chmod +x /app/scripts/docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]
