import type { ProjectPayload } from "../project-upsert";

/**
 * Mapped to the GitHub repo `0clip` (LoL Clip Assistant).
 * Kept the existing portfolio slug `ai-video-cuts` for URL stability — the
 * repo is just the canonical source of code, the product framing in the
 * portfolio is "AI Video Cuts".
 */
export const aiVideoCuts: ProjectPayload = {
  slug: "ai-video-cuts",
  title: "AI Video Cuts (0clip)",
  shortDescription:
    "Pipeline interna que transforma VODs longos de League of Legends em Shorts verticais com legendas, via Whisper + GPT + FFmpeg.",
  category: "ai",
  status: "shipped",
  year: 2026,
  featured: false,
  order: 13,
  demoUrl: null,
  githubUrl: "https://github.com/devalexsantos/0clip",
  techSlugs: [
    "nodejs",
    "typescript",
    "fastify",
    "nextjs",
    "react",
    "tailwindcss",
    "shadcnui",
    "prisma",
    "postgresql",
    "redis",
    "openai",
    "docker",
  ],

  content: {
    "pt-BR": {
      fullDescription:
        "AI Video Cuts (codinome `0clip`) é uma pipeline interna de homelab que transforma VODs longos de League of Legends do YouTube (~3h) em cortes verticais para Shorts/TikTok/Reels com legenda burn-in. Usa Whisper para transcrição, GPT-4o-mini para detecção de momentos hype, FFmpeg para corte e composição vertical, yt-dlp para download por intervalo. Stack distribuída: Next.js (web) + Fastify (api) + BullMQ worker.",
      problem:
        "Streamer/creator de eSports tem horas de VOD por partida — encontrar manualmente os 30-60 segundos de hype para cortar como Short é trabalhoso e repetitivo. Tools comerciais (Opus.clip, Vizard) custam caro e não conhecem o vocabulário de LoL ('teamfight', 'baron steal', 'pentakill').",
      hypothesis:
        "Whisper transcreve a narração do VOD; GPT-4o-mini lê a transcrição em chunks e identifica passagens com alto pico emocional (keywords + linguagem natural); FFmpeg corta o intervalo e compõe um vídeo vertical 1080×1920 com gameplay centralizado, blur no background e legenda burn-in. Tudo automatizável.",
      targetAudience:
        "Eu mesmo, primeiro — para canal pessoal de LoL no Shorts. Modelo replicável para outros streamers competitivos.",
      technicalDecisions:
        "Monorepo npm workspaces. Fastify para api + Bull Board para painel de filas. Next.js + shadcn para web. BullMQ + Redis para fila. Prisma + Postgres para estado. Whisper API (`whisper-1`) com chunking em 18min + overlap 10s. GPT-4o-mini para análise (JSON strict). FFmpeg com libass para legenda burn-in. yt-dlp pinado no Dockerfile do worker.",
      learnings:
        "Whisper tem limite de 25MB por arquivo — solução foi transcodificar para MP3 64kbps mono antes de chunking. GPT em JSON strict reduziu muito o trabalho de parsing. O fallback de detecção por keywords (`pentakill`, `baron`, `clutch`) quando o LLM falha foi crucial — vídeos sem altíssimo pico de áudio antes geravam zero cortes.",
      nextSteps:
        "Detecção visual (frames) para complementar a narração; upload automático para YouTube Shorts/TikTok; controle fino de aspect ratio por destino; integração com PandaScore para metadata da partida (times, lane).",
    },
    en: {
      fullDescription:
        "AI Video Cuts (codename `0clip`) is an internal homelab pipeline that turns long League of Legends YouTube VODs (~3h) into vertical clips for Shorts/TikTok/Reels with burn-in subtitles. Uses Whisper for transcription, GPT-4o-mini for hype-moment detection, FFmpeg for cut and vertical composition, yt-dlp for interval download. Distributed stack: Next.js (web) + Fastify (api) + BullMQ worker.",
      problem:
        "An e-sports streamer/creator has hours of VOD per match — manually finding the 30-60 seconds of hype to cut into a Short is tedious and repetitive. Commercial tools (Opus.clip, Vizard) are expensive and don't know the LoL vocabulary ('teamfight', 'baron steal', 'pentakill').",
      hypothesis:
        "Whisper transcribes the VOD narration; GPT-4o-mini reads the transcript in chunks and flags emotionally-peaked passages (keywords + natural language); FFmpeg cuts the interval and composes a vertical 1080×1920 video with centered gameplay, background blur, and burn-in subtitles. Fully automatable.",
      targetAudience:
        "Myself first — for a personal LoL Shorts channel. Replicable model for other competitive streamers.",
      technicalDecisions:
        "npm workspaces monorepo. Fastify for api + Bull Board for queue dashboard. Next.js + shadcn for web. BullMQ + Redis for the queue. Prisma + Postgres for state. Whisper API (`whisper-1`) chunked at 18min + 10s overlap. GPT-4o-mini for analysis (JSON strict). FFmpeg with libass for burn-in subtitles. yt-dlp pinned in the worker's Dockerfile.",
      learnings:
        "Whisper has a 25MB per-file limit — solution was to transcode to 64kbps mono MP3 before chunking. GPT in JSON strict mode cut parsing work massively. Keyword-based fallback detection (`pentakill`, `baron`, `clutch`) when the LLM fails was crucial — videos without huge audio peaks previously yielded zero clips.",
      nextSteps:
        "Visual frame detection to complement narration; automatic upload to YouTube Shorts/TikTok; per-destination aspect ratio control; PandaScore integration for match metadata (teams, lane).",
    },
  },

  architecture: {
    "pt-BR":
      "Monorepo com três apps: `apps/web` (Next.js — UI), `apps/api` (Fastify — REST + Bull Board), `apps/worker` (BullMQ worker — download + transcrição + análise + composição). Packages compartilhados em `packages/database` (Prisma) e `packages/shared` (types + helpers). Postgres para estado dos vídeos e clips. Redis como broker BullMQ. Storage local em volumes Docker (`/storage/{originals,audio,previews,final,subtitles}`).",
    en: "Monorepo with three apps: `apps/web` (Next.js — UI), `apps/api` (Fastify — REST + Bull Board), `apps/worker` (BullMQ worker — download + transcription + analysis + composition). Shared packages in `packages/database` (Prisma) and `packages/shared` (types + helpers). Postgres for video and clip state. Redis as BullMQ broker. Local storage in Docker volumes (`/storage/{originals,audio,previews,final,subtitles}`).",
  },

  challenges: {
    "pt-BR":
      "1) **Limite de 25MB do Whisper** — transcodificar para MP3 mono 64kbps + chunking em 18min com overlap de 10s. 2) **Detecção de hype** quando narração é genérica — fallback por keywords combinado com LLM, marcando origem em `reason: [llm|keywords|hybrid]`. 3) **`yt-dlp --download-sections` quebra em alguns VODs** — fallback baixa completo e corta com FFmpeg. 4) **Legenda burn-in com FFmpeg + libass** exigiu instalar `fonts-dejavu-core` e `fonts-noto-core` no Dockerfile do worker.",
    en: "1) **Whisper's 25MB limit** — transcode to 64kbps mono MP3 + chunking at 18min with 10s overlap. 2) **Hype detection** when narration is generic — keyword fallback combined with LLM, marking origin in `reason: [llm|keywords|hybrid]`. 3) **`yt-dlp --download-sections` breaks on some VODs** — fallback downloads the full file and cuts with FFmpeg. 4) **Burn-in subtitles with FFmpeg + libass** required installing `fonts-dejavu-core` and `fonts-noto-core` in the worker Dockerfile.",
  },

  readme: {
    "pt-BR": `# AI Video Cuts (0clip) — detalhamento técnico

\`0clip\` é o nome interno; "AI Video Cuts" é o framing no portfólio. Projeto de homelab que automatiza a parte mais chata de criar Shorts: assistir 3h de VOD para achar 60s de hype.

## Pipeline de uma partida

\`\`\`mermaid
flowchart LR
  ENQ["POST /videos<br/>(VOD + N matches)"] --> API[Fastify]
  API --> Q[(Redis<br/>BullMQ)]
  Q --> W[Worker]

  W --> DL["DOWNLOADING<br/>yt-dlp --download-sections"]
  DL --> VAL["VALIDATING<br/>ffprobe"]
  VAL --> AUD["EXTRACTING_AUDIO<br/>ffmpeg mp3 mono 64kbps"]
  AUD --> TR["TRANSCRIBING<br/>Whisper (chunks 18m)"]
  TR --> AN["ANALYZING<br/>GPT-4o-mini (chunks 25m)"]
  AN --> PRE["GENERATING_PREVIEWS<br/>ffmpeg 720p"]
  PRE --> READY["READY<br/>(usuário aprova)"]
  READY --> FIN["RENDERING_FINAL<br/>vertical 1080×1920 + legenda"]
  FIN --> DONE((DONE))
\`\`\`

## Topologia

\`\`\`mermaid
flowchart TB
  subgraph Apps
    WEB["apps/web<br/>Next.js :3000"]
    API_BOX["apps/api<br/>Fastify :3333 + Bull Board"]
    WORK["apps/worker<br/>BullMQ + yt-dlp + ffmpeg"]
  end
  subgraph Storage
    VOL["/storage<br/>originals, audio,<br/>previews, final, subtitles"]
  end
  subgraph Infra
    PG[(PostgreSQL :5434)]
    R[(Redis :6379)]
  end

  WEB --> API_BOX
  API_BOX --> PG
  API_BOX --> R
  R --> WORK
  WORK --> PG
  WORK --> VOL
  WEB --> VOL
\`\`\`

## Custos típicos OpenAI

Para uma partida típica de **40 min**:

| Item | Modelo | Estimativa |
|---|---|---|
| Transcrição | whisper-1 ($0.006/min) | ~**$0.24** |
| Análise | gpt-4o-mini | ~**$0.02** |
| **Total por partida** | | **~$0.26** |

Vídeo com 3 partidas (MD3) ≈ **$0.80**.

## Chunking interno

\`\`\`mermaid
flowchart LR
  VOD["VOD 40min"] --> W18["Whisper:<br/>18min + overlap 10s<br/>= 3 chamadas"]
  VOD --> G25["GPT:<br/>25min por chunk<br/>= 2 chamadas"]
\`\`\`

## Fallback de detecção de hype

\`\`\`mermaid
flowchart LR
  TR["Transcript"] --> LLM["GPT-4o-mini<br/>JSON strict"]
  LLM --> N{"N candidatos?"}
  N -- "≥ esperado" --> CL["clips finais"]
  N -- "&lt; esperado" --> KW["fallback keywords<br/>(pentakill, baron, clutch...)"]
  KW --> MERGE["mergeCandidates"]
  LLM --> MERGE
  MERGE --> CL
\`\`\`

Cada candidato carrega \`reason: [llm | keywords | hybrid]\` para rastreabilidade no admin.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 15 (App Router), TanStack Query, shadcn/ui |
| Backend | Fastify 5, Zod, Pino, Bull Board |
| Worker | Node + BullMQ + yt-dlp + FFmpeg + libass |
| Banco | PostgreSQL + Prisma |
| Fila | BullMQ + Redis |
| IA | OpenAI Whisper (\`whisper-1\`) + GPT (\`gpt-4o-mini\`) |
| Composição | FFmpeg filter_complex (blur bg + gameplay center + subtitles burn-in) |
| Monorepo | npm workspaces |

## Decisões técnicas

- **Audio mono 64kbps**: encaixa no limite de 25MB do Whisper sem perder qualidade de transcrição (narração é fala humana).
- **Chunks com overlap**: 10s de overlap entre chunks Whisper evita corte no meio de palavra.
- **GPT em JSON strict mode**: elimina parsing manual; ganhos enormes em confiabilidade.
- **Fallback keywords**: garante saída útil mesmo quando o LLM falha em vídeos curtos ou com narração genérica.
- **\`packages/shared\` com helpers testáveis**: \`parseTimeToSeconds\`, \`formatSeconds\`, \`safeStoragePath\` (path traversal), etc. — 24 testes só nesse package.

## Cobertura de testes

- \`packages/shared\`: 24 testes (funções puras)
- \`apps/worker\`: 21 testes (\`analyzeTranscriptForHighlights\`, \`mergeCandidates\`, \`formatSrtTime\`)

## Fora de escopo (por design)

- Autenticação / multiusuário / billing
- Visão computacional (detecção por frame)
- Integrações de dados externos (PandaScore)
- Upload automático para redes sociais`,
    en: `# AI Video Cuts (0clip) — technical deep dive

\`0clip\` is the internal name; "AI Video Cuts" is the portfolio framing. A homelab project that automates the most tedious part of making Shorts: watching 3h of VOD to find 60s of hype.

## Per-match pipeline

\`\`\`mermaid
flowchart LR
  ENQ["POST /videos<br/>(VOD + N matches)"] --> API[Fastify]
  API --> Q[(Redis<br/>BullMQ)]
  Q --> W[Worker]

  W --> DL["DOWNLOADING<br/>yt-dlp --download-sections"]
  DL --> VAL["VALIDATING<br/>ffprobe"]
  VAL --> AUD["EXTRACTING_AUDIO<br/>ffmpeg mp3 mono 64kbps"]
  AUD --> TR["TRANSCRIBING<br/>Whisper (chunks 18m)"]
  TR --> AN["ANALYZING<br/>GPT-4o-mini (chunks 25m)"]
  AN --> PRE["GENERATING_PREVIEWS<br/>ffmpeg 720p"]
  PRE --> READY["READY<br/>(user approves)"]
  READY --> FIN["RENDERING_FINAL<br/>vertical 1080×1920 + subs"]
  FIN --> DONE((DONE))
\`\`\`

## Topology

\`\`\`mermaid
flowchart TB
  subgraph Apps
    WEB["apps/web<br/>Next.js :3000"]
    API_BOX["apps/api<br/>Fastify :3333 + Bull Board"]
    WORK["apps/worker<br/>BullMQ + yt-dlp + ffmpeg"]
  end
  subgraph Storage
    VOL["/storage<br/>originals, audio,<br/>previews, final, subtitles"]
  end
  subgraph Infra
    PG[(PostgreSQL :5434)]
    R[(Redis :6379)]
  end

  WEB --> API_BOX
  API_BOX --> PG
  API_BOX --> R
  R --> WORK
  WORK --> PG
  WORK --> VOL
  WEB --> VOL
\`\`\`

## Typical OpenAI costs

For a typical **40-min** match:

| Item | Model | Estimate |
|---|---|---|
| Transcription | whisper-1 ($0.006/min) | ~**$0.24** |
| Analysis | gpt-4o-mini | ~**$0.02** |
| **Total per match** | | **~$0.26** |

A 3-match video (MD3) ≈ **$0.80**.

## Internal chunking

\`\`\`mermaid
flowchart LR
  VOD["VOD 40min"] --> W18["Whisper:<br/>18min + overlap 10s<br/>= 3 calls"]
  VOD --> G25["GPT:<br/>25min per chunk<br/>= 2 calls"]
\`\`\`

## Hype-detection fallback

\`\`\`mermaid
flowchart LR
  TR["Transcript"] --> LLM["GPT-4o-mini<br/>JSON strict"]
  LLM --> N{"N candidates?"}
  N -- "≥ expected" --> CL["final clips"]
  N -- "&lt; expected" --> KW["keyword fallback<br/>(pentakill, baron, clutch...)"]
  KW --> MERGE["mergeCandidates"]
  LLM --> MERGE
  MERGE --> CL
\`\`\`

Each candidate carries \`reason: [llm | keywords | hybrid]\` for traceability in the admin.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router), TanStack Query, shadcn/ui |
| Backend | Fastify 5, Zod, Pino, Bull Board |
| Worker | Node + BullMQ + yt-dlp + FFmpeg + libass |
| DB | PostgreSQL + Prisma |
| Queue | BullMQ + Redis |
| AI | OpenAI Whisper (\`whisper-1\`) + GPT (\`gpt-4o-mini\`) |
| Composition | FFmpeg filter_complex (blur bg + gameplay center + burn-in subs) |
| Monorepo | npm workspaces |

## Technical decisions

- **64kbps mono audio**: fits Whisper's 25MB limit without losing transcription quality (it's human speech).
- **Chunks with overlap**: 10s overlap between Whisper chunks avoids mid-word cuts.
- **GPT in JSON strict mode**: eliminates manual parsing; massive reliability gains.
- **Keyword fallback**: guarantees useful output even when the LLM fails on short or generic-narration videos.
- **\`packages/shared\` with testable helpers**: \`parseTimeToSeconds\`, \`formatSeconds\`, \`safeStoragePath\` (path traversal), etc. — 24 tests in that package alone.

## Test coverage

- \`packages/shared\`: 24 tests (pure functions)
- \`apps/worker\`: 21 tests (\`analyzeTranscriptForHighlights\`, \`mergeCandidates\`, \`formatSrtTime\`)

## Out of scope (by design)

- Authentication / multi-user / billing
- Computer vision (frame detection)
- External data integrations (PandaScore)
- Automatic upload to social media`,
  },

  features: [
    {
      title: { "pt-BR": "Pipeline VOD → Shorts", en: "VOD → Shorts pipeline" },
      description: {
        "pt-BR": "Download por intervalo (yt-dlp), transcrição (Whisper), análise (GPT), composição vertical (FFmpeg).",
        en: "Interval download (yt-dlp), transcription (Whisper), analysis (GPT), vertical composition (FFmpeg).",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "Detecção híbrida de hype", en: "Hybrid hype detection" },
      description: {
        "pt-BR": "GPT-4o-mini em JSON strict + fallback por keywords. Cada candidato traceável por origem.",
        en: "GPT-4o-mini in JSON strict + keyword fallback. Every candidate traceable by origin.",
      },
      order: 2,
    },
    {
      title: { "pt-BR": "Composição 1080×1920 com legenda burn-in", en: "1080×1920 composition with burn-in subs" },
      description: {
        "pt-BR": "FFmpeg filter_complex: gameplay centralizado + blur de fundo + legenda renderizada via libass.",
        en: "FFmpeg filter_complex: centered gameplay + background blur + subtitles via libass.",
      },
      order: 3,
    },
    {
      title: { "pt-BR": "Bull Board para fila", en: "Bull Board for the queue" },
      description: {
        "pt-BR": "Painel admin em `/admin/queues` para inspecionar jobs ativos, falhados e retry.",
        en: "Admin dashboard at `/admin/queues` to inspect active, failed and retried jobs.",
      },
      order: 4,
    },
  ],

  decisions: [
    {
      title: { "pt-BR": "Áudio mono 64kbps antes do Whisper", en: "Mono 64kbps audio before Whisper" },
      reason: { "pt-BR": "Limite de 25MB por arquivo no Whisper", en: "Whisper's 25MB per-file cap" },
      description: {
        "pt-BR":
          "Transcodificar reduz drasticamente o tamanho sem perder qualidade de fala. Chunking de 18min cobre VODs longos.",
        en: "Transcoding shrinks size dramatically without losing speech quality. 18-min chunking covers long VODs.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "GPT em JSON strict + fallback keywords", en: "GPT in JSON strict + keyword fallback" },
      reason: { "pt-BR": "LLM falha em VODs sem grandes picos", en: "LLM fails on VODs without big peaks" },
      description: {
        "pt-BR":
          "JSON strict elimina parsing manual; keywords (pentakill, baron, clutch) garantem saída útil em todo caso.",
        en: "JSON strict removes manual parsing; keywords (pentakill, baron, clutch) ensure useful output in any case.",
      },
      order: 2,
    },
  ],
};
