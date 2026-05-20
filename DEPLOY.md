# Deploy — EasyPanel (VPS)

How to deploy this app on a VPS running EasyPanel and load all existing data
as the initial content.

The app is a Next.js standalone build. On every boot the container entrypoint
(`docker-entrypoint.sh`) runs `prisma migrate deploy` **before** serving
traffic, so the database schema is created/updated automatically on each
deploy.

---

## 1. Services to create

Create three services inside the **same EasyPanel project** so they reach each
other over the internal network.

### a) PostgreSQL — ⚠️ must be pgvector

> The first migration runs `CREATE EXTENSION "vector"` and uses `vector(1536)`
> columns for the RAG/chatbot embeddings. **A plain Postgres image makes the
> deploy fail on boot.**

- Create a Postgres service and set the image to **`pgvector/pgvector:pg17`**.
- Note the credentials and the internal host (e.g. `myproject_postgres`).

### b) Redis

- Use the Redis template (image `redis:7-alpine` is fine).
- Used for chat rate limiting. Note the internal host (e.g. `myproject_redis`).

### c) App

- Create an **App** service from the GitHub repo
  `devalexsantos/santosalex-dev` (build via the included `Dockerfile`).
- Internal port: **3000**.
- Add a domain + HTTPS in EasyPanel.

---

## 2. Environment variables (App service)

Set these on the App service (mirror your local `.env`, adjusting hosts/URLs).
Generate fresh secrets for production.

```
DATABASE_URL=postgresql://<user>:<pass>@<internal-postgres-host>:5432/<db>
REDIS_URL=redis://<internal-redis-host>:6379
APP_URL=https://your-domain.com
NODE_ENV=production

ADMIN_PASSWORD=<strong value>
SESSION_SECRET=<new strong random value>

AI_PROVIDER=<as in .env>
OPENAI_API_KEY=<...>
AI_CHAT_MODEL=<...>
AI_EMBEDDING_MODEL=<...>
AI_EMBEDDING_DIMENSIONS=1536

CHAT_DAILY_LIMIT=<...>
CHAT_MINUTE_LIMIT=<...>

AWS_REGION=<...>
AWS_ACCESS_KEY_ID=<...>
AWS_SECRET_ACCESS_KEY=<...>
AWS_S3_BUCKET=<...>
```

Notes:
- `DATABASE_URL` / `REDIS_URL` use the **internal hostnames** EasyPanel shows
  for each service.
- Keep the **same `AWS_S3_BUCKET`** as local: uploaded project images are
  stored as S3 URLs in the database, so the files already exist in the bucket
  and load directly (bucket must allow public reads).

---

## 3. Deploy order

1. Start **PostgreSQL (pgvector)** and **Redis**.
2. Deploy the **App** with the env vars above. On boot it runs
   `prisma migrate deploy`, creating the schema + the `vector` extension.
   Confirm the app is up at your domain (it will have no content yet).
3. Load the data — see section 4.
4. Verify: open `/pt-BR/projects`, the project gallery, and the chatbot.

---

## 4. Load existing data (dump → restore)

The `prisma/seed.ts` script only recreates Technologies, a few Projects and the
Posts. It does **not** recreate your Profile, FAQs, Experiences, Role Types, the
full project list, or the chatbot embeddings (those were entered via the admin /
generated via OpenAI). To guarantee **all** current data, dump and restore the
database.

### Step 1 — generate the data dump (local machine)

With the local DB running (`npm run db:up`):

```bash
./scripts/dump-data.sh
```

This writes `portfolio_data_<timestamp>.sql` at the repo root. It is **data
only** (the production schema is created by migrations), runs `pg_dump` inside
the compose container (matching client/server version), excludes
`_prisma_migrations`, and uses `--disable-triggers` so foreign keys restore in
any order. The embeddings (`AiChunk.embedding`, `vector(1536)`) are included, so
the chatbot works immediately in production with no OpenAI re-indexing.

### Step 2 — restore into production

The production DB must already exist with the schema applied (i.e. the App
booted once in step 3.2).

**Option A — connect from your machine (simplest):**
In EasyPanel, temporarily expose the Postgres port (Service → enable external
access), then:

```bash
psql "postgresql://<user>:<pass>@<vps-host>:<exposed-port>/<db>" \
  -f portfolio_data_<timestamp>.sql
```

Disable external access again afterwards.

**Option B — upload + restore inside the server:**
Copy the `.sql` into the Postgres container (or a mounted volume) via the
EasyPanel file manager / console, then run `psql -U <user> -d <db> -f <file>`
from the service console.

> `--disable-triggers` requires the restoring role to be a superuser or table
> owner. EasyPanel's managed Postgres user owns its database, so this works by
> default.

### Restoring more than once

The restore appends rows. If you need to re-run it, reset the data first
(schema stays intact). From the Postgres console:

```sql
TRUNCATE TABLE
  "AiChunk","AiDocument","AiChatMessage","AiFeedback","ContactMessage",
  "ProjectImage","ProjectStack","ProjectFeature","ProjectDecision",
  "Project","Post","ProfileFaq","ProfileExperience","ProfileRoleType",
  "Profile","Technology","UserAdmin"
RESTART IDENTITY CASCADE;
```

Then run the restore again.

---

## 5. Redeploys

Push to `main` (or trigger a redeploy in EasyPanel). The new image builds and
the entrypoint applies any new migrations automatically before serving — no
manual migration step needed.

---

## Troubleshooting

- **Boot fails on `CREATE EXTENSION "vector"` / `type "vector" does not exist`**
  → the Postgres image is not pgvector. Switch it to `pgvector/pgvector:pg17`.
- **App logs `FATAL: DATABASE_URL is not set`** → env var missing on the App
  service.
- **Restore errors `permission denied: ... DISABLE TRIGGER`** → restore with the
  database owner/superuser role.
- **Gallery / cover images 403 or broken** → the S3 bucket isn't serving objects
  publicly. Add a bucket policy granting public `s3:GetObject` (and check Block
  Public Access).
- **Chatbot returns "not enough context"** → embeddings missing. Either the dump
  didn't include `AiChunk`/`AiDocument`, or you seeded instead of restoring. Run
  the dump/restore, or regenerate with
  `npx tsx scripts/backfill-ai-documents.ts && npx tsx scripts/index-pending-documents.ts`.
