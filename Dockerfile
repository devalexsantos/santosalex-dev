### deps ------------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

### prisma-cli -----------------------------------------------------------
# Isolated install of the Prisma CLI + its transitive deps (effect, tsx,
# dotenv, etc.) so the runner can run `migrate deploy` without dragging in
# the full builder node_modules. The Next.js standalone output bundles
# only the deps the server itself imports, which excludes the CLI tree.
FROM node:22-alpine AS prisma-cli
WORKDIR /prisma-cli
RUN apk add --no-cache libc6-compat openssl
RUN npm init -y > /dev/null && \
    npm install --omit=dev --no-save \
      prisma@7.8.0 \
      tsx@4.22.0 \
      dotenv@17.4.2

### builder ---------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma 7's prisma.config.ts resolves env() eagerly. We don't need a real DB
# during `prisma generate` (it only emits TS types) so feed a placeholder.
# `next build` ALSO doesn't talk to the real DB — it just compiles routes —
# so the same placeholder is safe for that step too.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

### runner ----------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Prisma CLI from the isolated stage — required by the entrypoint to run
# `migrate deploy` on each startup. Kept in a separate dir so it doesn't
# clash with the standalone server's bundled deps.
COPY --from=prisma-cli --chown=nextjs:nodejs /prisma-cli/node_modules /app/prisma-cli/node_modules

# Entrypoint script runs prisma migrate deploy then execs the Next server.
COPY --chown=nextjs:nodejs docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENTRYPOINT ["/app/docker-entrypoint.sh"]
