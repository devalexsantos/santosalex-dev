import type { ProjectPayload } from "../project-upsert";

export const zerochat: ProjectPayload = {
  slug: "zerochat",
  title: "ZeroChat",
  shortDescription:
    "Chat com IA para sites — primeiro responde via base de conhecimento, escala para atendimento humano quando necessário.",
  category: "ai",
  status: "in_progress",
  year: 2025,
  featured: false,
  order: 2,
  demoUrl: null,
  githubUrl: "https://github.com/devalexsantos/zerochat",
  techSlugs: [
    "nextjs",
    "typescript",
    "react",
    "tailwindcss",
    "shadcnui",
    "fastify",
    "prisma",
    "postgresql",
    "redis",
    "openai",
    "resend",
    "stripe",
    "docker",
  ],

  content: {
    "pt-BR": {
      fullDescription:
        "ZeroChat é um widget de chat embarcável para sites que combina IA generativa (OpenAI) com uma base de conhecimento ingerida por upload de PDF/DOCX/XLSX, e escala para atendimento humano quando a IA não consegue responder com confiança. É composto por landing page institucional, app SaaS (Next.js) com dashboard e analytics, server Fastify com fila BullMQ + worker para ingestão de documentos, e um widget standalone embedável via `<script>`.",
      problem:
        "Lojas e SaaS perdem leads quando o usuário tem dúvida fora do horário comercial. Chatbots tradicionais respondem com scripts engessados e frustram. Atendimento humano 24/7 é caro. Falta um meio-termo: IA que conheça o produto pela documentação real e saiba a hora de chamar um humano.",
      hypothesis:
        "Se o operador faz upload da documentação (PDF/DOCX/XLSX) e o sistema responde primeiro com base nela, a IA cobre 70%+ dos casos. Quando a confiança cai (baixos chunks relevantes, usuário insiste, ou pede atendente explicitamente), o chat escala — coletando contato e enviando para a fila humana.",
      targetAudience:
        "Lojas virtuais (e-commerce e produtos digitais), SaaS B2B com base de conhecimento, escritórios de prestação de serviços — qualquer operação que receba perguntas repetitivas e tenha documentação escrita disponível.",
      technicalDecisions:
        "OpenAI para chat e embeddings, busca vetorial via pgvector no Postgres (mesmo banco do produto, sem stack adicional), Fastify + BullMQ para a ingestão assíncrona, Redis como broker + rate limit, Resend para escalonamento humano por e-mail, Stripe para billing recorrente. Widget é vanilla TS sem framework para minimizar payload no site hospedeiro.",
      learnings:
        "O sinal de 'baixa confiança' que aciona o escalonamento exigiu mais engenharia que a IA em si — combinação de número de chunks acima de threshold, score de similaridade e detecção de palavras-chave do usuário. Separar ingestão (worker BullMQ) do chat (síncrono) foi essencial: parsing de PDF/XLSX é lento e quebraria a UX se ficasse na resposta da request.",
      nextSteps:
        "Modo voz com Whisper para sites de atendimento; conector WhatsApp via API oficial; auto-classificação de tickets escalados (urgência, departamento); painel para o atendente humano dentro do próprio app.",
    },
    en: {
      fullDescription:
        "ZeroChat is an embeddable site chat widget that combines generative AI (OpenAI) with a knowledge base ingested from PDF/DOCX/XLSX uploads, and escalates to human support when the AI can't answer confidently. It includes a marketing landing page, a SaaS app (Next.js) with dashboard and analytics, a Fastify server with a BullMQ queue + worker for ingestion, and a standalone widget embedded via `<script>`.",
      problem:
        "Stores and SaaS lose leads when users have questions outside business hours. Traditional chatbots reply with rigid scripts and frustrate visitors. 24/7 human support is expensive. There's a missing middle: AI that actually knows the product from its real docs and knows when to hand off to a human.",
      hypothesis:
        "If the operator uploads documentation (PDF/DOCX/XLSX) and the system answers from it first, the AI handles 70%+ of cases. When confidence drops (few relevant chunks, user insists, or asks for a human directly), the chat escalates — collecting contact and routing to the human queue.",
      targetAudience:
        "Online stores (e-commerce and digital products), B2B SaaS with a knowledge base, service operations — anyone fielding repetitive questions with written documentation available.",
      technicalDecisions:
        "OpenAI for chat and embeddings, vector search via pgvector in Postgres (same DB as the product, no extra stack), Fastify + BullMQ for async ingestion, Redis as broker + rate limiter, Resend for human-escalation emails, Stripe for recurring billing. Widget is vanilla TS without a framework to minimize payload on the host site.",
      learnings:
        "The 'low confidence' signal that triggers escalation took more engineering than the AI itself — combining number of chunks above a similarity threshold, score, and detection of user keywords. Splitting ingestion (BullMQ worker) from chat (synchronous) was essential: PDF/XLSX parsing is slow and would break the UX if it lived inside the request.",
      nextSteps:
        "Voice mode with Whisper for support-heavy sites; WhatsApp connector via the official API; auto-classification of escalated tickets (urgency, department); a human-agent inbox inside the app.",
    },
  },

  architecture: {
    "pt-BR":
      "Quatro componentes coordenados: `app/` (Next.js — dashboard SaaS, autenticação, billing, analytics), `server/` (Fastify — API REST + ingestão BullMQ + integração OpenAI), `widget/` (vanilla TS — componente embedável no site cliente) e `lp/` (landing institucional). Postgres com pgvector armazena tanto dados relacionais quanto embeddings; Redis cumpre dois papéis: broker do BullMQ para jobs de ingestão e rate limiter por IP. A fila assíncrona desacopla parsing pesado (PDF, DOCX, XLSX via `mammoth` e `pdf-parse`) da resposta ao usuário, que continua síncrona e rápida.",
    en: "Four coordinated components: `app/` (Next.js — SaaS dashboard, auth, billing, analytics), `server/` (Fastify — REST API + BullMQ ingestion + OpenAI integration), `widget/` (vanilla TS — embeddable component on the customer's site), and `lp/` (marketing landing). Postgres with pgvector stores both relational data and embeddings; Redis plays two roles: BullMQ broker for ingestion jobs and per-IP rate limiter. The async queue decouples heavy parsing (PDF, DOCX, XLSX via `mammoth` and `pdf-parse`) from the user reply, which stays synchronous and fast.",
  },

  challenges: {
    "pt-BR":
      "1) **Detectar baixa confiança da IA** sem cair em loop infinito de escalonamento. 2) **Parsing de XLSX** com células mescladas e fórmulas — várias bibliotecas falham em formatos comuns; teve que tratar caso a caso. 3) **Rate limit no widget público** sem prejudicar usuário legítimo, considerando que o IP pode ser o mesmo de muita gente atrás de NAT. 4) **Onboarding de novo cliente** — leva minutos por causa do upload + embedding inicial, então a UI mostra progresso em tempo real do BullMQ.",
    en: "1) **Detecting AI low-confidence** without spiraling into an escalation loop. 2) **XLSX parsing** with merged cells and formulas — many libraries fail on common formats; had to special-case. 3) **Rate-limiting the public widget** without punishing legitimate users, since a shared IP behind NAT may represent many people. 4) **New customer onboarding** takes minutes due to the upload + initial embedding, so the UI streams BullMQ progress in real time.",
  },

  readme: {
    "pt-BR": `# ZeroChat — detalhamento técnico

ZeroChat junta três coisas que normalmente vivem em produtos separados: RAG sobre documentação do cliente, escalonamento para humano com coleta de contato, e widget embarcável que não polui o site hospedeiro. Esta seção descreve como cada peça se conecta.

## Componentes e topologia

\`\`\`mermaid
flowchart TB
  subgraph Site["Site do cliente"]
    WIDGET["Widget &lt;script&gt;<br/>vanilla TS"]
  end

  subgraph Server["Fastify (server/)"]
    API["API REST<br/>/chat, /docs/upload"]
    WORKER["Worker BullMQ<br/>ingestão de docs"]
  end

  subgraph App["Next.js (app/)"]
    DASH["Dashboard SaaS<br/>billing, analytics"]
  end

  subgraph Data["Infra"]
    PG[("PostgreSQL<br/>+ pgvector")]
    R[("Redis<br/>BullMQ + rate limit")]
    OPENAI["OpenAI<br/>chat + embeddings"]
    RESEND["Resend<br/>escalonamento humano"]
  end

  WIDGET -->|"mensagem do usuário"| API
  API --> PG
  API --> OPENAI
  API --> R
  API -->|"baixa confiança"| RESEND

  DASH --> PG
  DASH -->|"upload PDF/DOCX/XLSX"| API
  API -->|"enqueue job"| R
  R --> WORKER
  WORKER --> PG
  WORKER --> OPENAI
\`\`\`

## Fluxo de uma conversa

\`\`\`mermaid
sequenceDiagram
  participant U as Visitante
  participant W as Widget
  participant A as API
  participant DB as Postgres+pgvector
  participant AI as OpenAI

  U->>W: "Como troco meu plano?"
  W->>A: POST /chat (msg + sessionId)
  A->>AI: embedding(msg)
  A->>DB: top-k chunks por similaridade
  alt chunks suficientes (k≥3, score≥threshold)
    A->>AI: chat completion(contexto + msg)
    AI-->>A: resposta confiante
    A-->>W: stream SSE
  else baixa confiança
    A->>W: "Posso te conectar com um atendente?"
    U->>W: nome / e-mail / WhatsApp
    A->>DB: cria Ticket
    A->>RESEND: notifica operador
  end
\`\`\`

## Ingestão de documentos

A ingestão é assíncrona via BullMQ porque parsing de XLSX e PDF grandes leva segundos e bloquearia o upload.

\`\`\`mermaid
flowchart LR
  UPLOAD["POST /docs/upload<br/>(multipart)"] --> S3["S3<br/>arquivo original"]
  UPLOAD --> ENQUEUE["enfileira job<br/>BullMQ"]
  ENQUEUE --> WORKER["Worker"]
  WORKER --> PARSE{"Tipo?"}
  PARSE -->|PDF| PDF["pdf-parse"]
  PARSE -->|DOCX| DOCX["mammoth"]
  PARSE -->|XLSX| XLSX["xlsx → linhas em texto"]
  PDF --> CHUNK["chunking<br/>(800 tokens / overlap 100)"]
  DOCX --> CHUNK
  XLSX --> CHUNK
  CHUNK --> EMBED["OpenAI<br/>embeddings"]
  EMBED --> SAVE["pgvector<br/>(insert)"]
\`\`\`

## Stack

| Camada | Tecnologia |
|---|---|
| App SaaS | Next.js 15 (App Router), TanStack Query, Recharts, shadcn/ui |
| Server | Fastify, @fastify/jwt, @fastify/multipart, @fastify/rate-limit |
| Banco | PostgreSQL + pgvector (mesmo banco do produto, sem stack vetorial separada) |
| Fila | BullMQ + Redis |
| IA | OpenAI chat + text-embedding-3-small |
| Parsing | mammoth (DOCX), pdf-parse (PDF), xlsx (XLSX) |
| Billing | Stripe (Subscriptions + webhook) |
| E-mail | Resend |
| Storage | AWS S3 (presigned URL para uploads grandes) |

## Detecção de "baixa confiança"

Não basta confiar no score do top-k. A heurística atual combina:

1. **Score mínimo** do top-1 chunk (\`< 0.78\` → baixa confiança)
2. **Spread** entre top-1 e top-3 (chunks dispersos = pergunta mal coberta)
3. **Palavras-chave do usuário**: "atendente", "humano", "falar com alguém", "não entendi"
4. **Contagem de turnos sem progresso** (mesma pergunta reformulada 2x)

Quando dois desses sinais disparam, o chat oferece escalonamento, coleta nome + contato e cria um Ticket. O operador recebe e-mail via Resend e responde direto pelo dashboard.

## Decisões técnicas relevantes

- **Vanilla TS no widget**: nada de React/Vue no site cliente — o widget tem que ser <30KB, isolado em iframe + Shadow DOM e não derrubar páginas existentes.
- **pgvector dentro do mesmo Postgres**: evita ter Pinecone/Weaviate/Qdrant separado. Para o tamanho de base esperado (até ~5k documentos por cliente), pgvector é suficiente e barato.
- **Rate limit por session + por IP**: \`@fastify/rate-limit\` com keyGenerator combinando sessionId do widget e IP, para que um IP de NAT corporativo não bloqueie todos os usuários.

## Fora de escopo (por design)

- Treinamento fine-tune de modelos
- Suporte a áudio/imagem nas mensagens (planejado, não MVP)
- Multi-modelo / fallback OpenRouter (planejado pós-launch)`,
    en: `# ZeroChat — technical deep dive

ZeroChat combines three things that usually live in separate products: RAG over the customer's documentation, escalation to a human with contact capture, and an embeddable widget that doesn't pollute the host site. This section describes how each piece fits together.

## Components and topology

\`\`\`mermaid
flowchart TB
  subgraph Site["Customer site"]
    WIDGET["Widget &lt;script&gt;<br/>vanilla TS"]
  end

  subgraph Server["Fastify (server/)"]
    API["REST API<br/>/chat, /docs/upload"]
    WORKER["BullMQ worker<br/>document ingestion"]
  end

  subgraph App["Next.js (app/)"]
    DASH["SaaS dashboard<br/>billing, analytics"]
  end

  subgraph Data["Infra"]
    PG[("PostgreSQL<br/>+ pgvector")]
    R[("Redis<br/>BullMQ + rate limit")]
    OPENAI["OpenAI<br/>chat + embeddings"]
    RESEND["Resend<br/>human escalation"]
  end

  WIDGET -->|"user message"| API
  API --> PG
  API --> OPENAI
  API --> R
  API -->|"low confidence"| RESEND

  DASH --> PG
  DASH -->|"upload PDF/DOCX/XLSX"| API
  API -->|"enqueue job"| R
  R --> WORKER
  WORKER --> PG
  WORKER --> OPENAI
\`\`\`

## Conversation flow

\`\`\`mermaid
sequenceDiagram
  participant U as Visitor
  participant W as Widget
  participant A as API
  participant DB as Postgres+pgvector
  participant AI as OpenAI

  U->>W: "How do I change my plan?"
  W->>A: POST /chat (msg + sessionId)
  A->>AI: embedding(msg)
  A->>DB: top-k chunks by similarity
  alt enough chunks (k≥3, score≥threshold)
    A->>AI: chat completion(context + msg)
    AI-->>A: confident reply
    A-->>W: SSE stream
  else low confidence
    A->>W: "Want me to connect you with an agent?"
    U->>W: name / email / WhatsApp
    A->>DB: creates Ticket
    A->>RESEND: notifies operator
  end
\`\`\`

## Document ingestion

Ingestion is async via BullMQ because parsing large XLSX/PDF takes seconds and would block the upload.

\`\`\`mermaid
flowchart LR
  UPLOAD["POST /docs/upload<br/>(multipart)"] --> S3["S3<br/>original file"]
  UPLOAD --> ENQUEUE["enqueue job<br/>BullMQ"]
  ENQUEUE --> WORKER["Worker"]
  WORKER --> PARSE{"Type?"}
  PARSE -->|PDF| PDF["pdf-parse"]
  PARSE -->|DOCX| DOCX["mammoth"]
  PARSE -->|XLSX| XLSX["xlsx → text rows"]
  PDF --> CHUNK["chunking<br/>(800 tokens / overlap 100)"]
  DOCX --> CHUNK
  XLSX --> CHUNK
  CHUNK --> EMBED["OpenAI<br/>embeddings"]
  EMBED --> SAVE["pgvector<br/>(insert)"]
\`\`\`

## Stack

| Layer | Tech |
|---|---|
| SaaS app | Next.js 15 (App Router), TanStack Query, Recharts, shadcn/ui |
| Server | Fastify, @fastify/jwt, @fastify/multipart, @fastify/rate-limit |
| DB | PostgreSQL + pgvector (same DB as the product, no separate vector stack) |
| Queue | BullMQ + Redis |
| AI | OpenAI chat + text-embedding-3-small |
| Parsing | mammoth (DOCX), pdf-parse (PDF), xlsx (XLSX) |
| Billing | Stripe (Subscriptions + webhook) |
| Email | Resend |
| Storage | AWS S3 (presigned URL for big uploads) |

## "Low confidence" detection

Top-k score alone isn't enough. The current heuristic combines:

1. **Min score** of the top-1 chunk (\`< 0.78\` → low confidence)
2. **Spread** between top-1 and top-3 (scattered chunks = question poorly covered)
3. **User keywords**: "agent", "human", "talk to someone", "I don't understand"
4. **Stalled turn count** (same question rephrased 2x)

When two of those signals fire, the chat offers escalation, collects name + contact and creates a Ticket. The operator gets an email via Resend and replies from inside the dashboard.

## Notable decisions

- **Vanilla TS widget**: no React/Vue inside the customer's site — the widget must be <30KB, isolated in iframe + Shadow DOM, and not break existing pages.
- **pgvector in the same Postgres**: no separate Pinecone/Weaviate/Qdrant. For the expected base size (up to ~5k docs per customer), pgvector is enough and cheap.
- **Rate limit per session + per IP**: \`@fastify/rate-limit\` with a keyGenerator mixing widget sessionId and IP, so a corporate NAT IP doesn't block every user.

## Out of scope (by design)

- Fine-tuning models
- Audio/image messages (planned, not MVP)
- Multi-model / OpenRouter fallback (planned post-launch)`,
  },

  features: [
    {
      title: { "pt-BR": "Widget embedável", en: "Embeddable widget" },
      description: {
        "pt-BR":
          "Script único de <30KB. Roda dentro de iframe + Shadow DOM, sem conflito de CSS com o site hospedeiro.",
        en: "A single <30KB script. Runs inside iframe + Shadow DOM, no CSS conflict with the host site.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "RAG sobre documentos do cliente", en: "RAG over the customer's documents" },
      description: {
        "pt-BR":
          "Upload de PDF, DOCX e XLSX. Parsing assíncrono via BullMQ, embeddings na OpenAI, busca por similaridade no pgvector.",
        en: "Upload PDF, DOCX and XLSX. Async parsing via BullMQ, OpenAI embeddings, similarity search in pgvector.",
      },
      order: 2,
    },
    {
      title: { "pt-BR": "Escalonamento para humano", en: "Human escalation" },
      description: {
        "pt-BR":
          "Quando a confiança cai ou o usuário pede, o chat coleta nome + contato e abre Ticket. Operador recebe por e-mail.",
        en: "When confidence drops or the user asks, the chat collects name + contact and opens a Ticket. Operator gets notified by email.",
      },
      order: 3,
    },
    {
      title: { "pt-BR": "Dashboard de analytics", en: "Analytics dashboard" },
      description: {
        "pt-BR":
          "Métricas de conversa (resolvidas vs. escaladas), top perguntas sem cobertura, custo OpenAI por dia.",
        en: "Conversation metrics (resolved vs. escalated), top uncovered questions, daily OpenAI cost.",
      },
      order: 4,
    },
    {
      title: { "pt-BR": "Billing recorrente", en: "Recurring billing" },
      description: {
        "pt-BR":
          "Stripe Subscriptions com webhook sincronizando estado no Postgres. Trial e upgrade self-service.",
        en: "Stripe Subscriptions with webhook syncing state into Postgres. Self-service trial and upgrade.",
      },
      order: 5,
    },
  ],

  decisions: [
    {
      title: { "pt-BR": "Vector store dentro do Postgres", en: "Vector store inside Postgres" },
      reason: { "pt-BR": "Evita custo + complexidade de Pinecone/Qdrant separado", en: "Avoids extra cost and complexity of Pinecone/Qdrant" },
      description: {
        "pt-BR":
          "pgvector cobre o tamanho de base esperado (~5k docs/cliente) e roda no mesmo container do Postgres do produto.",
        en: "pgvector covers the expected base size (~5k docs/customer) and runs in the same Postgres container as the product.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "Ingestão fora do request", en: "Ingestion outside the request" },
      reason: { "pt-BR": "Parsing pesado bloquearia o upload e o navegador do usuário", en: "Heavy parsing would block the upload and the user's browser" },
      description: {
        "pt-BR":
          "PDF/DOCX/XLSX vai para BullMQ. O upload responde imediatamente com um jobId; a UI faz polling no progresso.",
        en: "PDF/DOCX/XLSX goes to BullMQ. The upload responds immediately with a jobId; the UI polls for progress.",
      },
      order: 2,
    },
    {
      title: { "pt-BR": "Widget vanilla TS, não React", en: "Vanilla TS widget, not React" },
      reason: { "pt-BR": "Mantém payload < 30KB e zero conflito com o site hospedeiro", en: "Keeps payload < 30KB and avoids host-site conflicts" },
      description: {
        "pt-BR":
          "Frameworks pesados aumentam o bundle e podem conflitar com versões já carregadas. Vanilla + iframe + Shadow DOM isola tudo.",
        en: "Heavy frameworks bloat the bundle and may clash with versions already loaded. Vanilla + iframe + Shadow DOM isolates everything.",
      },
      order: 3,
    },
  ],
};
