# santosalex — Portfolio Dev + AI

Portfólio fullstack com Next.js 16, RAG (pgvector), Redis, Docker e i18n (pt-BR / en).

Stack: Next.js · React 19 · TypeScript · Tailwind v4 · shadcn/ui · Framer Motion · Prisma 7 · PostgreSQL · pgvector · Redis · OpenAI · next-intl · Docker.

> Documento-fonte: [`plano-portfolio-dev-ai.md`](./plano-portfolio-dev-ai.md).

## Quickstart

```bash
# 1. instalar dependências
npm install

# 2. configurar variáveis de ambiente
cp .env.example .env
# edite .env e preencha OPENAI_API_KEY quando for usar IA

# 3. subir Postgres (com pgvector) e Redis
npm run db:up

# 4. aplicar migrations e popular dados iniciais
npm run db:migrate
npm run db:seed

# 5. rodar em desenvolvimento
npm run dev
# http://localhost:3000  → redireciona para /pt-BR
# /en disponível em http://localhost:3000/en
```

## Scripts úteis

| Script | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção (`output: standalone`) |
| `npm run start` | Inicia o build de produção |
| `npm run lint` | ESLint |
| `npm run db:up` | Sobe Postgres + Redis no Docker |
| `npm run db:down` | Para os containers |
| `npm run db:migrate` | Roda `prisma migrate dev` |
| `npm run db:reset` | Reseta o banco e re-roda seed |
| `npm run db:seed` | Roda `prisma/seed.ts` |
| `npm run db:studio` | Abre Prisma Studio |
| `npm run prisma:generate` | Gera o Prisma Client |

## Arquitetura (Fase 1 — Fundação)

- `src/app/[locale]/` — App Router com segmento de locale (pt-BR / en)
- `src/i18n/` — configuração do `next-intl` (`routing`, `request`, `navigation`)
- `src/proxy.ts` — middleware do next-intl (Next 16 renomeou `middleware.ts` para `proxy.ts`)
- `src/messages/` — JSON de traduções por locale
- `src/lib/prisma.ts` — singleton do Prisma Client com `PrismaPg` adapter
- `src/lib/redis.ts` — cliente `ioredis` lazy
- `src/lib/ai/*` — provider OpenAI + stubs de embeddings/RAG (implementados na Fase 5)
- `src/lib/auth/admin-session.ts` — stub (Fase 4)
- `src/lib/rate-limit.ts` — stub (Fase 5)
- `prisma/schema.prisma` — modelos de Project, Post, AiDocument, AiChunk (com `vector(1536)`), etc.
- `prisma.config.ts` — config Prisma 7 (substitui `url` do `datasource`)

## Roadmap

| Fase | Conteúdo | Status |
| --- | --- | --- |
| 1 — Fundação | Next.js + Prisma + pgvector + i18n + Docker base | ✅ |
| 2 — Design System | tokens, layout shell, Navbar/Footer, BentoGrid, ProjectCard | ✅ |
| 3 — Conteúdo público | Home, /projects, case studies, /stack, /build-notes, /contact | ✅ |
| 4 — Admin | login simples, CRUD de projetos/posts/tech/AI docs/chat logs | ✅ |
| 5 — RAG | chunking, embeddings, busca vetorial, chat API + UI, rate-limit Redis, profile sync | ✅ |
| 6 — Premium | Recruiter Mode, chat feedback, admin metrics | ✅ |
| 7 — Produção | SEO, sitemap, hreflang, JSON-LD, OG dinâmico, ISR, Docker, deploy EasyPanel | ✅ |

## Deploy em VPS (EasyPanel)

O projeto **não** depende da Vercel. É um app standalone Next.js (Node) + Postgres com `pgvector` + Redis. Pode rodar em qualquer VPS com Docker; o caminho oficial é EasyPanel.

### 1. Provisione os serviços

No EasyPanel, crie um projeto e adicione:

| Serviço | Imagem | Notas |
| --- | --- | --- |
| `postgres` | `pgvector/pgvector:pg17` | Volume persistente em `/var/lib/postgresql/data`; abrir porta interna `5432` para o app. |
| `redis`    | `redis:7-alpine`          | Sem volume necessário (cache + rate-limit). |
| `app`      | Build a partir do repositório | Dockerfile na raiz; multi-stage com `output: "standalone"`. |

### 2. Variáveis de ambiente (`app`)

```env
# DB & cache — apontam para os serviços EasyPanel criados acima
DATABASE_URL="postgresql://portfolio:senha-forte@postgres:5432/portfolio"
REDIS_URL="redis://redis:6379"

# URL pública (com https, sem barra final) — usada por sitemap, robots, OG, JSON-LD
APP_URL="https://seu-dominio.com"
NODE_ENV="production"

# Admin
ADMIN_PASSWORD="<gere com: openssl rand -hex 32>"
SESSION_SECRET="<gere com: openssl rand -hex 32>"

# IA
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-..."
AI_CHAT_MODEL="gpt-4.1-mini"
AI_EMBEDDING_MODEL="text-embedding-3-small"
AI_EMBEDDING_DIMENSIONS="1536"

# Rate limits do chat público
CHAT_DAILY_LIMIT="50"
CHAT_MINUTE_LIMIT="10"
```

> `APP_URL` afeta sitemap, robots, hreflang, JSON-LD e `metadataBase` para Open Graph. Configurar errado quebra SEO.

### 3. Build + start

EasyPanel constrói o `Dockerfile`. O container final roda `node server.js` na porta `3000`. Aponte o domínio do EasyPanel para essa porta — o Caddy/Traefik dele resolve TLS automaticamente.

### 4. Migrations e seed

**Migrations: automáticas.** O entrypoint do container roda `prisma migrate deploy` a cada startup (idempotente — Prisma ignora migrations já aplicadas). Cada redeploy aplica novas migrations antes de aceitar tráfego.

**Seed inicial (opcional, uma vez):** se quiser popular o site com os projetos de exemplo + tecnologias + 2 build notes, rode do seu laptop apontando pro DB de produção:

```bash
DATABASE_URL="postgresql://portfolio:senha-forte@db-host:5432/portfolio" \
  npx prisma db seed
```

Depois é só logar em `/admin/login` com `ADMIN_PASSWORD`, editar Profile / Projects, e o RAG é re-indexado automaticamente em cada save.

### 5. Healthcheck (recomendado no EasyPanel)

- **HTTP**: `GET /` → 200
- **Periodicidade**: 30s

### 6. Local: docker compose para reproduzir produção

```bash
docker compose --profile prod up -d --build
# http://localhost:3000
```

## Notas técnicas

- **Prisma 7** removeu o `url` do bloco `datasource`. Conexão fica em `prisma.config.ts` e o Client é instanciado com `PrismaPg` adapter (`src/lib/prisma.ts`).
- **Next 16** deprecou `middleware.ts` — usa `proxy.ts` rodando em Node runtime.
- **pgvector**: a extensão é criada automaticamente pelo Prisma (preview `postgresqlExtensions`). Dimensão do embedding configurada em `AI_EMBEDDING_DIMENSIONS` (default 1536, compatível com `text-embedding-3-small`).
- **i18n**: rotas sempre prefixadas (`/pt-BR/...`, `/en/...`). Locale default = `pt-BR`.
