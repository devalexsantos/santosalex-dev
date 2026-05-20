import type { ProjectPayload } from "../project-upsert";

export const tunify: ProjectPayload = {
  slug: "tunify",
  title: "Tunify",
  shortDescription:
    "SaaS de wallpapers automotivos com IA: upload da foto do carro, escolhe tema, paga via Stripe/PIX, gera com GPT-4 Vision.",
  category: "ai",
  status: "shipped",
  year: 2026,
  featured: false,
  order: 10,
  demoUrl: null,
  githubUrl: "https://github.com/devalexsantos/tunify",
  techSlugs: [
    "nextjs",
    "typescript",
    "react",
    "tailwindcss",
    "fastify",
    "prisma",
    "postgresql",
    "redis",
    "openai",
    "stripe",
    "docker",
    "zod",
  ],

  content: {
    "pt-BR": {
      fullDescription:
        "Tunify é um SaaS de geração de wallpapers automotivos com IA. O usuário faz upload de uma foto do carro, escolhe tema (cinematográfico, JDM, racing, etc.) e formato (mobile, desktop, ultrawide), compra créditos via Stripe ou PIX (Abacate Pay) e gera wallpapers usando OpenAI GPT-4 Vision (`gpt-image-1`). Monorepo com frontend Next.js + backend Fastify + worker BullMQ.",
      problem:
        "Comunidade entusiasta de carros adora personalizar wallpaper com a foto do próprio veículo — mas editor manual (Photoshop) é trabalhoso e apps genéricos de wallpaper não permitem usar a foto real. Mercado de nicho com pagantes dispostos.",
      hypothesis:
        "Se um usuário sobe a foto do próprio carro, escolhe estilo e paga por gerar (PIX micro-pagamento), obtém wallpaper cinematográfico personalizado em poucos cliques. PIX no Brasil resolve o pagamento de baixo ticket.",
      targetAudience:
        "Entusiastas brasileiros de carros, principalmente público jovem (18-35) ativo em redes sociais e grupos de tuning. Ticket médio R$ 5-15 por wallpaper.",
      technicalDecisions:
        "Monorepo `app/` (Next.js 15 + NextAuth v5) + `server/` (Fastify 5 + Prisma + BullMQ worker). Postgres 16 + Redis 7. OpenAI GPT-4 Vision com `gpt-image-1`. Stripe para cartão internacional e Abacate Pay para PIX. AWS S3 com presigned URL para upload. Worker BullMQ com concurrency=2 para controlar custo OpenAI.",
      learnings:
        "PIX micro-pagamento no Brasil tem fricção menor que cartão — Abacate Pay com webhook resolveu sem complexidade. GPT-4 Vision (`gpt-image-1`) é caro por chamada, então worker com concurrency limitada + créditos pré-comprados protege margem.",
      nextSteps:
        "Marketplace de templates de tema criados pela comunidade; assinatura mensal vs. créditos avulsos; integração com Instagram para auto-postar; suporte a vídeo (`gpt-image-1` → animação).",
    },
    en: {
      fullDescription:
        "Tunify is an automotive-wallpaper SaaS powered by AI. The user uploads a photo of their car, picks a theme (cinematic, JDM, racing, etc.) and format (mobile, desktop, ultrawide), buys credits via Stripe or PIX (Abacate Pay), and generates wallpapers using OpenAI GPT-4 Vision (`gpt-image-1`). Monorepo with Next.js frontend + Fastify backend + BullMQ worker.",
      problem:
        "Car enthusiasts love wallpapers with their own vehicle — but manual editors (Photoshop) are tedious, and generic wallpaper apps don't let you use your real photo. Niche market with willing payers.",
      hypothesis:
        "If a user uploads their car's photo, picks a style and pays per generation (PIX micro-payment), they get a cinematic personalized wallpaper in a few clicks. PIX in Brazil solves low-ticket payment friction.",
      targetAudience:
        "Brazilian car enthusiasts, mostly young (18-35) active on social media and tuning groups. Average ticket R$ 5-15 per wallpaper.",
      technicalDecisions:
        "Monorepo `app/` (Next.js 15 + NextAuth v5) + `server/` (Fastify 5 + Prisma + BullMQ worker). Postgres 16 + Redis 7. OpenAI GPT-4 Vision with `gpt-image-1`. Stripe for international cards and Abacate Pay for PIX. AWS S3 with presigned URL for upload. BullMQ worker with concurrency=2 to control OpenAI cost.",
      learnings:
        "PIX micro-payment in Brazil has lower friction than card — Abacate Pay with webhook solved it without complexity. GPT-4 Vision (`gpt-image-1`) is expensive per call, so a limited-concurrency worker + pre-paid credits protect margins.",
      nextSteps:
        "Community-built theme template marketplace; monthly subscription vs. one-off credits; Instagram integration for auto-posting; video support (`gpt-image-1` → animation).",
    },
  },

  architecture: {
    "pt-BR":
      "Dois apps independentes compartilhando Postgres e Redis: `app/` (Next.js 15 + NextAuth v5 beta — login Google + Credentials, TanStack Query, UI minimalista) e `server/` (Fastify 5 + Prisma — REST API + BullMQ worker em containers separados). Postgres armazena usuários, créditos, jobs e wallpapers gerados. Redis é broker BullMQ. S3 armazena imagens originais e geradas. Pagamento: Stripe (cartão) + Abacate Pay (PIX) com webhook único atualizando créditos.",
    en: "Two independent apps sharing Postgres and Redis: `app/` (Next.js 15 + NextAuth v5 beta — Google + Credentials login, TanStack Query, minimal UI) and `server/` (Fastify 5 + Prisma — REST API + BullMQ worker in separate containers). Postgres stores users, credits, jobs and generated wallpapers. Redis is the BullMQ broker. S3 stores original and generated images. Payment: Stripe (card) + Abacate Pay (PIX) with a single webhook updating credits.",
  },

  challenges: {
    "pt-BR":
      "1) **Custo do OpenAI** — `gpt-image-1` é caro; worker com concurrency=2 + créditos pré-comprados evita estouro. 2) **PIX no Brasil** sem usar Stripe (que não cobre bem) — Abacate Pay com webhook foi a saída. 3) **Upload de foto de carro** com tamanhos enormes (smartphone tira foto 4MB+) — presigned URL S3 direto do browser evita passar pelo backend.",
    en: "1) **OpenAI cost** — `gpt-image-1` is expensive; worker with concurrency=2 + pre-paid credits avoids blowup. 2) **PIX in Brazil** without using Stripe (poor coverage) — Abacate Pay with webhook was the way. 3) **Car photo uploads** at huge sizes (smartphone shots 4MB+) — direct browser-to-S3 presigned URL avoids hitting the backend.",
  },

  readme: {
    "pt-BR": `# Tunify — detalhamento técnico

Tunify é o experimento mais nichado do meu portfólio — SaaS B2C de wallpapers automotivos com IA. Apesar do nicho, a arquitetura técnica é completa: dois apps, worker BullMQ, dois gateways de pagamento (cartão + PIX) e integração com GPT-4 Vision.

## Topologia

\`\`\`mermaid
flowchart LR
  USER["Usuário"] --> APP["app/<br/>Next.js 15 + NextAuth v5"]
  APP -->|"presigned URL"| S3["AWS S3<br/>foto original"]
  APP -->|"REST"| SRV["server/<br/>Fastify 5"]
  SRV --> PG[("Postgres")]
  SRV -->|"enqueue"| R[("Redis<br/>BullMQ")]
  R --> W["Worker<br/>concurrency=2"]
  W --> OPENAI["OpenAI GPT-4 Vision<br/>gpt-image-1"]
  W --> S3
  W --> PG
  APP -->|"checkout"| STRIPE["Stripe<br/>cartão"]
  APP -->|"PIX"| ABACATE["Abacate Pay<br/>PIX"]
  STRIPE -->|"webhook"| SRV
  ABACATE -->|"webhook"| SRV
\`\`\`

## Fluxo de geração

\`\`\`mermaid
sequenceDiagram
  participant U as Usuário
  participant APP as Next app
  participant S3 as S3
  participant SRV as Server
  participant W as Worker
  participant AI as OpenAI

  U->>APP: upload foto carro
  APP->>S3: presigned URL (PUT direto)
  S3-->>APP: ok
  U->>APP: escolhe tema + formato
  APP->>SRV: POST /generate { creditCheck }
  SRV->>PG: decrementa crédito
  SRV->>R: enqueue job
  SRV-->>APP: jobId
  R->>W: job
  W->>AI: gpt-image-1 (foto + prompt do tema)
  AI-->>W: imagem gerada
  W->>S3: upload wallpaper
  W->>PG: marca pronto
  APP-->>U: notifica (polling) → download
\`\`\`

## Modelo de pagamento

\`\`\`mermaid
flowchart LR
  USER["Usuário"] -->|"R$ 5/10/20"| CHOICE{"Forma?"}
  CHOICE -->|"Cartão internacional"| STRIPE["Stripe Checkout"]
  CHOICE -->|"PIX"| ABACATE["Abacate Pay"]
  STRIPE --> WH["/webhooks/payment"]
  ABACATE --> WH
  WH --> PG[("UPDATE credits += N")]
\`\`\`

Um único endpoint de webhook trata ambos, normalizando o payload pelo header (Stripe assina, Abacate envia bearer interno).

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 15, React 19, Tailwind 4, NextAuth v5 (beta), TanStack Query |
| Backend | Fastify 5, Zod, Pino, @fastify/swagger |
| Banco | Postgres 16 + Prisma |
| Fila | BullMQ + Redis 7 |
| IA | OpenAI \`gpt-image-1\` |
| Storage | AWS S3 (presigned URL) |
| Pagamento | Stripe + Abacate Pay (PIX) |
| Auth | NextAuth v5 (Google OAuth + Credentials, JWT, bcrypt) |
| Deploy | Docker (api + worker em containers separados) |

## Decisões técnicas

- **Worker com concurrency=2**: OpenAI vision é caro e tem rate limit; serializar evita estouro de budget e 429.
- **Créditos pré-pagos em vez de cobrança por uso**: usuário compra X gerações; controle de cap fica trivial.
- **Abacate Pay para PIX**: Stripe no Brasil ainda é ruim para PIX; Abacate é provider local com webhook simples.
- **Upload direto pro S3**: smartphone tira foto 4MB+; presigned URL evita gargalo no backend.

## Roadmap

- Marketplace de temas criados pela comunidade
- Assinatura mensal (Stripe Subscriptions)
- Auto-post no Instagram
- Suporte a wallpaper animado / vídeo`,
    en: `# Tunify — technical deep dive

Tunify is the most niche experiment in my portfolio — a B2C SaaS for AI-generated car wallpapers. Despite the niche, the technical architecture is complete: two apps, BullMQ worker, two payment gateways (card + PIX) and GPT-4 Vision integration.

## Topology

\`\`\`mermaid
flowchart LR
  USER["User"] --> APP["app/<br/>Next.js 15 + NextAuth v5"]
  APP -->|"presigned URL"| S3["AWS S3<br/>original photo"]
  APP -->|"REST"| SRV["server/<br/>Fastify 5"]
  SRV --> PG[("Postgres")]
  SRV -->|"enqueue"| R[("Redis<br/>BullMQ")]
  R --> W["Worker<br/>concurrency=2"]
  W --> OPENAI["OpenAI GPT-4 Vision<br/>gpt-image-1"]
  W --> S3
  W --> PG
  APP -->|"checkout"| STRIPE["Stripe<br/>card"]
  APP -->|"PIX"| ABACATE["Abacate Pay<br/>PIX"]
  STRIPE -->|"webhook"| SRV
  ABACATE -->|"webhook"| SRV
\`\`\`

## Generation flow

\`\`\`mermaid
sequenceDiagram
  participant U as User
  participant APP as Next app
  participant S3 as S3
  participant SRV as Server
  participant W as Worker
  participant AI as OpenAI

  U->>APP: upload car photo
  APP->>S3: presigned URL (direct PUT)
  S3-->>APP: ok
  U->>APP: picks theme + format
  APP->>SRV: POST /generate { creditCheck }
  SRV->>PG: decrement credit
  SRV->>R: enqueue job
  SRV-->>APP: jobId
  R->>W: job
  W->>AI: gpt-image-1 (photo + theme prompt)
  AI-->>W: generated image
  W->>S3: upload wallpaper
  W->>PG: mark ready
  APP-->>U: notify (polling) → download
\`\`\`

## Payment model

\`\`\`mermaid
flowchart LR
  USER["User"] -->|"R$ 5/10/20"| CHOICE{"Method?"}
  CHOICE -->|"International card"| STRIPE["Stripe Checkout"]
  CHOICE -->|"PIX"| ABACATE["Abacate Pay"]
  STRIPE --> WH["/webhooks/payment"]
  ABACATE --> WH
  WH --> PG[("UPDATE credits += N")]
\`\`\`

A single webhook endpoint handles both, normalizing the payload by header (Stripe signs, Abacate sends an internal bearer).

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15, React 19, Tailwind 4, NextAuth v5 (beta), TanStack Query |
| Backend | Fastify 5, Zod, Pino, @fastify/swagger |
| DB | Postgres 16 + Prisma |
| Queue | BullMQ + Redis 7 |
| AI | OpenAI \`gpt-image-1\` |
| Storage | AWS S3 (presigned URL) |
| Payment | Stripe + Abacate Pay (PIX) |
| Auth | NextAuth v5 (Google OAuth + Credentials, JWT, bcrypt) |
| Deploy | Docker (api + worker in separate containers) |

## Technical decisions

- **Worker with concurrency=2**: OpenAI vision is expensive and rate-limited; serializing avoids budget blowup and 429.
- **Pre-paid credits instead of pay-per-use**: user buys X generations; capping is trivial.
- **Abacate Pay for PIX**: Stripe in Brazil is still poor for PIX; Abacate is a local provider with a simple webhook.
- **Direct S3 upload**: smartphones produce 4MB+ photos; presigned URL avoids backend bottleneck.

## Roadmap

- Community-built theme marketplace
- Monthly subscription (Stripe Subscriptions)
- Instagram auto-post
- Animated wallpaper / video support`,
  },

  features: [
    {
      title: { "pt-BR": "Upload e geração com IA", en: "Upload and AI generation" },
      description: {
        "pt-BR": "Upload direto para S3 via presigned URL. Geração via OpenAI `gpt-image-1` em worker BullMQ.",
        en: "Direct upload to S3 via presigned URL. Generation via OpenAI `gpt-image-1` in a BullMQ worker.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "Temas e formatos múltiplos", en: "Multiple themes and formats" },
      description: {
        "pt-BR": "Cinematográfico, JDM, racing. Mobile, desktop, ultrawide. Cada combinação tem prompt próprio.",
        en: "Cinematic, JDM, racing. Mobile, desktop, ultrawide. Each combination has its own prompt.",
      },
      order: 2,
    },
    {
      title: { "pt-BR": "Pagamento Stripe + PIX", en: "Stripe + PIX payment" },
      description: {
        "pt-BR": "Stripe Checkout para cartão. Abacate Pay para PIX. Webhook único atualiza créditos.",
        en: "Stripe Checkout for card. Abacate Pay for PIX. Single webhook updates credits.",
      },
      order: 3,
    },
    {
      title: { "pt-BR": "Sistema de créditos", en: "Credit system" },
      description: {
        "pt-BR": "Compra de R$ 5/10/20 dá X gerações. Decrementa no enfileiramento, não na finalização.",
        en: "R$ 5/10/20 purchases give X generations. Decrements at enqueue, not on completion.",
      },
      order: 4,
    },
  ],

  decisions: [
    {
      title: { "pt-BR": "Worker com concurrency=2", en: "Worker with concurrency=2" },
      reason: { "pt-BR": "Custo OpenAI + rate limit do `gpt-image-1`", en: "OpenAI cost + `gpt-image-1` rate limit" },
      description: {
        "pt-BR":
          "Serializar gera previsibilidade de custo e evita 429. Em pico, fila cresce mas não há estouro.",
        en: "Serializing keeps cost predictable and avoids 429. At peak, queue grows but no blowup.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "PIX via Abacate Pay", en: "PIX via Abacate Pay" },
      reason: { "pt-BR": "Stripe é ruim com PIX no Brasil", en: "Stripe handles PIX poorly in Brazil" },
      description: {
        "pt-BR":
          "Abacate Pay tem webhook simples; pagamento PIX é instantâneo, ideal para micro-ticket.",
        en: "Abacate Pay has a simple webhook; PIX payment is instant, ideal for micro-tickets.",
      },
      order: 2,
    },
  ],
};
