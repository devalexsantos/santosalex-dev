import type { ProjectPayload } from "../project-upsert";

export const zeromovie: ProjectPayload = {
  slug: "0movie",
  title: "0movie",
  shortDescription:
    "Pipeline automatizado de geração de vídeos curtos (Shorts/TikTok/Reels) com OpenAI + Runway + ElevenLabs + FFmpeg.",
  category: "ai",
  status: "in_progress",
  year: 2026,
  featured: true,
  order: 4,
  demoUrl: null,
  githubUrl: "https://github.com/devalexsantos/0movie",
  techSlugs: [
    "nodejs",
    "typescript",
    "fastify",
    "prisma",
    "postgresql",
    "redis",
    "openai",
    "docker",
    "zod",
  ],

  content: {
    "pt-BR": {
      fullDescription:
        "0movie é uma pipeline automatizada de geração de vídeos curtos (YouTube Shorts, TikTok, Reels): a partir de um tema, monta roteiro (OpenAI), gera imagens de referência (DALL-E), produz cenas em vídeo (Runway), grava narração (ElevenLabs), compõe legendas, compõe o vídeo final 1080×1920 com FFmpeg e sobe tudo para S3. Arquitetura distribuída com 8 filas BullMQ orquestradas por um core que aguarda sinais de prontidão.",
      problem:
        "Criar vídeos curtos para redes sociais consome horas: roteiro, gravação, voz, edição. Dá pra automatizar a maior parte da pipeline com IAs especializadas, mas integrar 4 providers diferentes (OpenAI, Runway, ElevenLabs, S3) com retries, falhas parciais e fan-out exige um orquestrador.",
      hypothesis:
        "Se cada estágio (plano, imagens, cenas, voz, legendas, composição, thumbnail, metadata) for uma fila BullMQ independente, com um orquestrador que aguarda 'tudo pronto' antes do compose final, a pipeline escala lateralmente, sobrevive a falhas parciais e pode ser pausada/retomada por estágio.",
      targetAudience:
        "Creators de conteúdo automatizado, gestores de canais multi-tema, e qualquer projeto pessoal que precise produzir vídeo em série sem operar studio.",
      technicalDecisions:
        "Fastify para a API REST (com `x-api-key` por simplicidade). BullMQ + Redis para 8 filas — cada estágio tem worker próprio que pode escalar isolado. Prisma + Postgres como source-of-truth do job e dos assets gerados. Integrações isoladas em `packages/integrations` (OpenAI, Runway, ElevenLabs, S3). FFmpeg para composição final via `packages/media`. Monorepo npm workspaces.",
      learnings:
        "Orquestração de pipeline com fan-out e fan-in é o coração — separar 'aguardando assets' de 'pronto para compose' simplificou muito a lógica. O Runway demora muito (1-3 min por cena), então o worker dele tem timeout alto e backoff progressivo. Gerar thumbnail e metadata como estágios finais paralelos foi fácil porque o compose já saiu pronto.",
      nextSteps:
        "Upload automático para YouTube/TikTok via APIs oficiais; controle fino de aspect ratio (1:1, 9:16, 4:5) por destino; preview de cada cena antes do compose final; templates de roteiro por nicho.",
    },
    en: {
      fullDescription:
        "0movie is an automated short-form video generation pipeline (YouTube Shorts, TikTok, Reels): given a theme, it builds the script (OpenAI), generates reference images (DALL-E), produces scene videos (Runway), records narration (ElevenLabs), composes subtitles, assembles the final 1080×1920 video with FFmpeg and uploads everything to S3. Distributed architecture with 8 BullMQ queues orchestrated by a core that waits for readiness signals.",
      problem:
        "Producing short-form social-media videos takes hours: script, recording, voice, editing. Most of the pipeline can be automated with specialist AIs, but integrating 4 different providers (OpenAI, Runway, ElevenLabs, S3) with retries, partial failures and fan-out demands an orchestrator.",
      hypothesis:
        "If each stage (plan, images, scenes, voice, subtitles, compose, thumbnail, metadata) is an independent BullMQ queue, with an orchestrator waiting for 'all ready' before the final compose, the pipeline scales horizontally, survives partial failures, and can be paused/resumed per stage.",
      targetAudience:
        "Automated content creators, multi-niche channel managers, and any personal project that needs to produce serial video without a studio.",
      technicalDecisions:
        "Fastify for the REST API (with `x-api-key` for simplicity). BullMQ + Redis for 8 queues — each stage has its own worker that scales independently. Prisma + Postgres as source-of-truth for the job and generated assets. Integrations isolated in `packages/integrations` (OpenAI, Runway, ElevenLabs, S3). FFmpeg for final composition via `packages/media`. Monorepo with npm workspaces.",
      learnings:
        "Pipeline orchestration with fan-out and fan-in is the heart — separating 'waiting for assets' from 'ready to compose' simplified the logic. Runway is slow (1-3 min per scene), so its worker has a high timeout and progressive backoff. Thumbnail and metadata as parallel final stages was easy because compose was already done.",
      nextSteps:
        "Automatic upload to YouTube/TikTok via official APIs; fine-grained aspect ratio control (1:1, 9:16, 4:5) per destination; per-scene preview before final compose; per-niche script templates.",
    },
  },

  architecture: {
    "pt-BR":
      "Monorepo npm workspaces com 4 apps + 5 packages. `apps/api` (Fastify REST), `apps/worker` (BullMQ workers — 1 binário com vários queue listeners), `apps/cron-hooks` (trigger por cron), `apps/admin` (planejado). Packages: `config` (env Zod), `db` (Prisma), `integrations` (clients OpenAI, Runway, ElevenLabs, S3), `media` (FFmpeg helpers), `core` (queue defs + processors + orchestrator). Postgres armazena Job + Asset; Redis é broker BullMQ. As 8 filas: plan, images, scenes, voice, subtitles, compose, thumbnail, metadata.",
    en: "npm workspaces monorepo with 4 apps + 5 packages. `apps/api` (Fastify REST), `apps/worker` (BullMQ workers — one binary with multiple queue listeners), `apps/cron-hooks` (cron trigger), `apps/admin` (planned). Packages: `config` (Zod env), `db` (Prisma), `integrations` (OpenAI, Runway, ElevenLabs, S3 clients), `media` (FFmpeg helpers), `core` (queue defs + processors + orchestrator). Postgres stores Job + Asset; Redis is the BullMQ broker. The 8 queues: plan, images, scenes, voice, subtitles, compose, thumbnail, metadata.",
  },

  challenges: {
    "pt-BR":
      "1) **Sincronização fan-in**: o estágio 'compose' depende de 4 inputs (cenas + voz + legendas + imagens) prontos. O orquestrador escuta evento de conclusão de cada fila e dispara compose só quando todos sinalizaram. 2) **Timeout do Runway**: geração de cena leva 1-3 min, então o worker tem timeout alto + backoff progressivo, e o status reflete fielmente no DB. 3) **Custos por job** — uma execução completa custa US$ 1-3, então metrificar e cancelar cedo é crítico.",
    en: "1) **Fan-in synchronization**: the 'compose' stage depends on 4 inputs (scenes + voice + subtitles + images) being ready. The orchestrator listens to each queue's completion event and triggers compose only when all signaled. 2) **Runway timeout**: scene generation takes 1-3 min, so the worker has a high timeout + progressive backoff, and status faithfully mirrors in the DB. 3) **Per-job cost** — one complete run costs US$1-3, so metering and early cancellation are critical.",
  },

  readme: {
    "pt-BR": `# 0movie — detalhamento técnico

0movie é a pipeline de IA mais complexa do meu portfólio: 8 filas BullMQ rodando em paralelo, 4 providers de IA encadeados, e um orquestrador que sincroniza fan-out + fan-in. Tudo para transformar um tema em vídeo curto pronto para postar.

## Pipeline em 8 estágios

\`\`\`mermaid
flowchart LR
  THEME["theme<br/>(input)"]
  THEME --> PLAN["plan<br/>OpenAI"]
  PLAN --> IMG["images<br/>DALL-E"]
  IMG --> SCENES["scenes<br/>Runway"]
  PLAN --> VOICE["voice<br/>ElevenLabs"]
  PLAN --> SUBS["subtitles<br/>SRT"]
  SCENES --> COMPOSE["compose<br/>FFmpeg"]
  VOICE --> COMPOSE
  SUBS --> COMPOSE
  COMPOSE --> THUMB["thumbnail<br/>FFmpeg"]
  COMPOSE --> META["metadata<br/>OpenAI"]
  THUMB --> DONE((COMPLETED))
  META --> DONE
\`\`\`

Cada caixa é uma fila BullMQ separada. O fan-in para \`compose\` é coordenado pelo orquestrador em \`packages/core\`.

## Topologia

\`\`\`mermaid
flowchart TB
  subgraph Apps["Apps"]
    API["apps/api<br/>Fastify REST"]
    WORKER["apps/worker<br/>BullMQ workers"]
    CRON["apps/cron-hooks<br/>trigger por agenda"]
  end

  subgraph Packages["Packages"]
    CORE["@0movie/core<br/>queues + orchestrator"]
    INT["@0movie/integrations<br/>OpenAI, Runway, ElevenLabs, S3"]
    MEDIA["@0movie/media<br/>FFmpeg helpers"]
    DB["@0movie/db<br/>Prisma"]
    CFG["@0movie/config<br/>env Zod"]
  end

  subgraph Infra["Infra"]
    PG[("PostgreSQL")]
    R[("Redis<br/>BullMQ")]
    S3["AWS S3"]
  end

  API --> CORE
  WORKER --> CORE
  CRON --> API
  CORE --> INT
  CORE --> MEDIA
  CORE --> DB
  CORE --> R
  DB --> PG
  INT --> S3
\`\`\`

## Schema (parcial)

\`\`\`mermaid
erDiagram
  Job ||--o{ JobStage : has
  Job ||--o{ Asset : produces
  JobStage }o--|| QueueName : "fila"

  Job {
    string id
    string theme
    enum status
    decimal costUsd
    datetime createdAt
  }
  JobStage {
    string id
    string jobId
    string queueName
    enum status
    json payload
    json result
  }
  Asset {
    string id
    string jobId
    enum kind
    string s3Url
  }
\`\`\`

## API

| Método | Path | Descrição |
|---|---|---|
| POST | \`/jobs/from-theme\` | Cria job a partir de tema |
| GET | \`/jobs/:id\` | Status do job + assets |
| POST | \`/jobs/:id/retry\` | Retenta job falhado |
| GET | \`/health\` | Healthcheck |

Auth via header \`x-api-key\` em tudo exceto \`/health\`.

## Orquestração fan-in

\`\`\`mermaid
sequenceDiagram
  participant ORCH as Orchestrator
  participant SC as scenes worker
  participant VO as voice worker
  participant SUB as subtitles worker
  participant CMP as compose worker

  par paralelo
    SC->>ORCH: scenes ready
  and
    VO->>ORCH: voice ready
  and
    SUB->>ORCH: subtitles ready
  end
  ORCH->>ORCH: todos prontos?
  ORCH->>CMP: enqueue compose
  CMP->>CMP: ffmpeg compose 1080x1920
  CMP-->>ORCH: composed
\`\`\`

## Custos típicos por job

| Estágio | Provider | Custo aprox |
|---|---|---|
| plan | OpenAI gpt-4o-mini | $0.01 |
| images (4 refs) | DALL-E | $0.15 |
| scenes (4 cenas) | Runway | $1.20 |
| voice (~30s) | ElevenLabs | $0.30 |
| compose | FFmpeg (CPU) | gratuito |
| **Total** | | **~$1.70** |

## Decisões técnicas

- **8 filas em vez de uma genérica**: cada provider tem tempo de resposta e custo próprios; escalar isolado é fundamental.
- **\`packages/core\` com orquestrador explícito**: evita lógica de sincronização espalhada nos workers.
- **\`x-api-key\` em vez de JWT**: é uso interno; complexidade extra não compensa.
- **Monorepo npm workspaces** em vez de TurboRepo: workspaces puros funcionam bem com 4 apps e build simples.

## Roadmap

- Upload automático para YouTube/TikTok
- Controle de aspect ratio por destino
- Preview de cada cena antes do compose
- Templates de roteiro por nicho`,
    en: `# 0movie — technical deep dive

0movie is the most complex AI pipeline in my portfolio: 8 BullMQ queues running in parallel, 4 AI providers chained together, and an orchestrator that synchronizes fan-out + fan-in. All to turn a theme into a ready-to-post short.

## 8-stage pipeline

\`\`\`mermaid
flowchart LR
  THEME["theme<br/>(input)"]
  THEME --> PLAN["plan<br/>OpenAI"]
  PLAN --> IMG["images<br/>DALL-E"]
  IMG --> SCENES["scenes<br/>Runway"]
  PLAN --> VOICE["voice<br/>ElevenLabs"]
  PLAN --> SUBS["subtitles<br/>SRT"]
  SCENES --> COMPOSE["compose<br/>FFmpeg"]
  VOICE --> COMPOSE
  SUBS --> COMPOSE
  COMPOSE --> THUMB["thumbnail<br/>FFmpeg"]
  COMPOSE --> META["metadata<br/>OpenAI"]
  THUMB --> DONE((COMPLETED))
  META --> DONE
\`\`\`

Each box is a separate BullMQ queue. The fan-in for \`compose\` is coordinated by the orchestrator in \`packages/core\`.

## Topology

\`\`\`mermaid
flowchart TB
  subgraph Apps["Apps"]
    API["apps/api<br/>Fastify REST"]
    WORKER["apps/worker<br/>BullMQ workers"]
    CRON["apps/cron-hooks<br/>schedule trigger"]
  end

  subgraph Packages["Packages"]
    CORE["@0movie/core<br/>queues + orchestrator"]
    INT["@0movie/integrations<br/>OpenAI, Runway, ElevenLabs, S3"]
    MEDIA["@0movie/media<br/>FFmpeg helpers"]
    DB["@0movie/db<br/>Prisma"]
    CFG["@0movie/config<br/>env Zod"]
  end

  subgraph Infra["Infra"]
    PG[("PostgreSQL")]
    R[("Redis<br/>BullMQ")]
    S3["AWS S3"]
  end

  API --> CORE
  WORKER --> CORE
  CRON --> API
  CORE --> INT
  CORE --> MEDIA
  CORE --> DB
  CORE --> R
  DB --> PG
  INT --> S3
\`\`\`

## Schema (partial)

\`\`\`mermaid
erDiagram
  Job ||--o{ JobStage : has
  Job ||--o{ Asset : produces
  JobStage }o--|| QueueName : "queue"

  Job {
    string id
    string theme
    enum status
    decimal costUsd
    datetime createdAt
  }
  JobStage {
    string id
    string jobId
    string queueName
    enum status
    json payload
    json result
  }
  Asset {
    string id
    string jobId
    enum kind
    string s3Url
  }
\`\`\`

## API

| Method | Path | Description |
|---|---|---|
| POST | \`/jobs/from-theme\` | Create job from theme |
| GET | \`/jobs/:id\` | Job status + assets |
| POST | \`/jobs/:id/retry\` | Retry a failed job |
| GET | \`/health\` | Healthcheck |

Auth via \`x-api-key\` header on everything except \`/health\`.

## Fan-in orchestration

\`\`\`mermaid
sequenceDiagram
  participant ORCH as Orchestrator
  participant SC as scenes worker
  participant VO as voice worker
  participant SUB as subtitles worker
  participant CMP as compose worker

  par parallel
    SC->>ORCH: scenes ready
  and
    VO->>ORCH: voice ready
  and
    SUB->>ORCH: subtitles ready
  end
  ORCH->>ORCH: all ready?
  ORCH->>CMP: enqueue compose
  CMP->>CMP: ffmpeg compose 1080x1920
  CMP-->>ORCH: composed
\`\`\`

## Typical per-job cost

| Stage | Provider | Approx cost |
|---|---|---|
| plan | OpenAI gpt-4o-mini | $0.01 |
| images (4 refs) | DALL-E | $0.15 |
| scenes (4 scenes) | Runway | $1.20 |
| voice (~30s) | ElevenLabs | $0.30 |
| compose | FFmpeg (CPU) | free |
| **Total** | | **~$1.70** |

## Technical decisions

- **8 queues instead of one generic**: each provider has its own latency and cost; isolated scaling is key.
- **Explicit orchestrator in \`packages/core\`**: avoids sync logic scattered across workers.
- **\`x-api-key\` instead of JWT**: it's internal use; extra complexity doesn't pay off.
- **npm workspaces** instead of TurboRepo: plain workspaces are fine with 4 apps and a simple build.

## Roadmap

- Auto upload to YouTube/TikTok
- Per-destination aspect ratio control
- Per-scene preview before compose
- Per-niche script templates`,
  },

  features: [
    {
      title: { "pt-BR": "8 estágios em pipeline", en: "8-stage pipeline" },
      description: {
        "pt-BR": "plan → images → scenes / voice / subtitles → compose → thumbnail + metadata. Cada um é uma fila.",
        en: "plan → images → scenes / voice / subtitles → compose → thumbnail + metadata. Each is a queue.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "Orquestração fan-in", en: "Fan-in orchestration" },
      description: {
        "pt-BR": "Compose só dispara quando cenas + voz + legendas + imagens sinalizam pronto.",
        en: "Compose only triggers when scenes + voice + subtitles + images all signal ready.",
      },
      order: 2,
    },
    {
      title: { "pt-BR": "4 providers de IA", en: "4 AI providers" },
      description: {
        "pt-BR": "OpenAI (script + metadata), DALL-E (imagens), Runway (cenas vídeo), ElevenLabs (voz).",
        en: "OpenAI (script + metadata), DALL-E (images), Runway (scene video), ElevenLabs (voice).",
      },
      order: 3,
    },
    {
      title: { "pt-BR": "FFmpeg compose 1080×1920", en: "FFmpeg compose 1080×1920" },
      description: {
        "pt-BR": "Composição vertical com burn-in de legenda e mix de áudio. Saída pronta para Shorts/TikTok/Reels.",
        en: "Vertical composition with subtitle burn-in and audio mix. Output ready for Shorts/TikTok/Reels.",
      },
      order: 4,
    },
    {
      title: { "pt-BR": "Custo por job rastreado", en: "Per-job cost tracking" },
      description: {
        "pt-BR": "Cada estágio reporta custo; campo `costUsd` no Job permite parar cedo se passar do orçamento.",
        en: "Each stage reports cost; the `costUsd` field on Job allows early cancellation if over budget.",
      },
      order: 5,
    },
  ],

  decisions: [
    {
      title: { "pt-BR": "Uma fila por estágio", en: "One queue per stage" },
      reason: { "pt-BR": "Cada provider tem latência e custo diferentes — escalar isolado", en: "Each provider has different latency and cost — isolated scaling" },
      description: {
        "pt-BR":
          "Worker do Runway pode escalar para 4 réplicas enquanto o de plan fica com 1; impossível com uma fila genérica.",
        en: "Runway worker can scale to 4 replicas while plan stays at 1; impossible with a single generic queue.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "Orquestrador centralizado", en: "Centralized orchestrator" },
      reason: { "pt-BR": "Sincronização fan-in espalhada vira bug logo", en: "Scattered fan-in sync turns into bugs fast" },
      description: {
        "pt-BR":
          "`packages/core` contém o orchestrator que reage a evento de conclusão e decide próximo estágio.",
        en: "`packages/core` contains the orchestrator that reacts to completion events and decides the next stage.",
      },
      order: 2,
    },
  ],
};
