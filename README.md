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

| Fase | Conteúdo |
| --- | --- |
| 1 — Fundação | ✅ ambiente local rodando (esta fase) |
| 2 — Design System | tokens, layout shell, Navbar/Footer, BentoGrid, ProjectCard |
| 3 — Conteúdo público | Home, /projects, case studies, /stack, /build-notes, /contact |
| 4 — Admin | login simples, CRUD de projetos/posts/AI documents |
| 5 — RAG | chunking, embeddings, busca vetorial, chat API + UI, rate-limit Redis |
| 6 — Premium | Recruiter Mode, Playground, RAG Visualizer |
| 7 — Produção | SEO, sitemap, OG, cache, Dockerfile validado, deploy EasyPanel |

## Deploy

O projeto **não** depende da Vercel. Para produção (VPS / EasyPanel):

```bash
docker compose --profile prod up -d --build
```

O `Dockerfile` é multi-stage e usa `output: "standalone"` do Next.

## Notas técnicas

- **Prisma 7** removeu o `url` do bloco `datasource`. Conexão fica em `prisma.config.ts` e o Client é instanciado com `PrismaPg` adapter (`src/lib/prisma.ts`).
- **Next 16** deprecou `middleware.ts` — usa `proxy.ts` rodando em Node runtime.
- **pgvector**: a extensão é criada automaticamente pelo Prisma (preview `postgresqlExtensions`). Dimensão do embedding configurada em `AI_EMBEDDING_DIMENSIONS` (default 1536, compatível com `text-embedding-3-small`).
- **i18n**: rotas sempre prefixadas (`/pt-BR/...`, `/en/...`). Locale default = `pt-BR`.
