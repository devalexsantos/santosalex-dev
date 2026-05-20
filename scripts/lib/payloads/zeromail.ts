import type { ProjectPayload } from "../project-upsert";

export const zeromail: ProjectPayload = {
  slug: "0mail",
  title: "0mail",
  shortDescription:
    "Cold email outreach self-hosted, inspirado no Instantly.ai — contas SMTP, leads, campanhas com sequências e worker rate-limitado.",
  category: "saas",
  status: "shipped",
  year: 2026,
  featured: false,
  order: 6,
  demoUrl: null,
  githubUrl: "https://github.com/devalexsantos/0mail",
  techSlugs: [
    "nextjs",
    "typescript",
    "react",
    "tailwindcss",
    "shadcnui",
    "tanstack-query",
    "prisma",
    "postgresql",
    "zod",
    "docker",
  ],

  content: {
    "pt-BR": {
      fullDescription:
        "0mail é um sistema self-hosted de cold email outreach inspirado no Instantly.ai. Gerencia contas SMTP, leads (com import CSV), campanhas multi-step com sequências, agenda timezone-aware com limites diários, worker em processo separado fazendo envio com rate limiting e dashboard com analytics. Stack: Next.js 15 + Prisma + Postgres + worker Node + Nodemailer.",
      problem:
        "Ferramentas comerciais de cold outreach (Instantly, Lemlist, Apollo) custam $50–200/mês. Para uso pessoal/homelab faz mais sentido ter o próprio sistema com SMTP de qualquer provider e zero limite de leads. Faltava algo open-source minimalista e bom o suficiente.",
      hypothesis:
        "Se eu replicar as funcionalidades essenciais do Instantly (contas múltiplas, sequências, schedule, worker com rate limit, analytics) num app único Next.js + Postgres, consigo enviar campanhas pessoais com custo só de hospedagem.",
      targetAudience:
        "Solo founders e indie hackers que querem fazer outreach próprio sem assinar SaaS caro. Devs que precisam validar leads para SaaS pessoais sem pagar Instantly antes de ter tração.",
      technicalDecisions:
        "Next.js 15 com App Router + API Routes para CRUD. TanStack Query para cache client-side dos dashboards. Prisma 6 + PostgreSQL 16. Worker em processo Node separado fazendo polling de 30s — não usei BullMQ porque o volume não justifica Redis. Nodemailer para envio SMTP. Tema dark por padrão (zinc-based).",
      learnings:
        "Polling de 30s é suficiente para cold email (não é tempo real). Separar o worker do app permite escalar processo de envio sem rebuildar Next. O ponto sutil foi o rate limit por conta SMTP: cada provider tem limites diferentes, e o worker calcula próximo slot considerando timezone do remetente.",
      nextSteps:
        "Tracking de abertura via pixel + click via redirect. A/B testing de subject lines. Warmup automatizado para contas novas. Integração com provedores de DKIM/SPF check.",
    },
    en: {
      fullDescription:
        "0mail is a self-hosted cold-email outreach system inspired by Instantly.ai. Manages SMTP accounts, leads (with CSV import), multi-step campaigns with sequences, timezone-aware schedule with daily caps, separate worker process sending with rate limiting, and a dashboard with analytics. Stack: Next.js 15 + Prisma + Postgres + Node worker + Nodemailer.",
      problem:
        "Commercial cold-outreach tools (Instantly, Lemlist, Apollo) cost $50–200/month. For personal/homelab use it makes more sense to have an own system with SMTP from any provider and zero lead cap. There was no minimalist, good-enough open-source option.",
      hypothesis:
        "Replicating the essential Instantly features (multiple accounts, sequences, schedule, rate-limited worker, analytics) in a single Next.js + Postgres app lets me run personal campaigns at hosting-only cost.",
      targetAudience:
        "Solo founders and indie hackers who want their own outreach without an expensive SaaS subscription. Devs validating leads for personal SaaS without paying Instantly before traction.",
      technicalDecisions:
        "Next.js 15 with App Router + API Routes for CRUD. TanStack Query for client-side cache on dashboards. Prisma 6 + PostgreSQL 16. Worker as a separate Node process polling every 30s — no BullMQ because volume doesn't justify Redis. Nodemailer for SMTP. Default dark theme (zinc-based).",
      learnings:
        "30s polling is enough for cold email (it's not real-time). Splitting the worker from the app lets us scale sending without rebuilding Next. The subtle bit was per-SMTP-account rate limiting: each provider has different caps, and the worker picks the next slot considering the sender's timezone.",
      nextSteps:
        "Open tracking via pixel + click tracking via redirect. A/B test of subject lines. Automated warmup for new accounts. DKIM/SPF check provider integration.",
    },
  },

  architecture: {
    "pt-BR":
      "Dois processos em containers separados: 1) **app Next.js** (UI, API routes, CRUD em Postgres) — todo o admin do sistema; 2) **worker Node** rodando polling de 30s, que consulta o Postgres por mensagens com `scheduledAt <= NOW()`, respeita rate limit por conta SMTP, envia via Nodemailer e atualiza status. Schema central: `EmailAccount`, `Lead`, `Campaign`, `CampaignStep`, `CampaignEnrollment`, `EmailMessage`. Worker é stateless — pode reiniciar a qualquer momento sem perder estado.",
    en: "Two processes in separate containers: 1) **Next.js app** (UI, API routes, Postgres CRUD) — the whole system admin; 2) **Node worker** polling every 30s, querying Postgres for messages with `scheduledAt <= NOW()`, honoring per-SMTP-account rate limit, sending via Nodemailer and updating status. Central schema: `EmailAccount`, `Lead`, `Campaign`, `CampaignStep`, `CampaignEnrollment`, `EmailMessage`. Worker is stateless — restart any time without losing state.",
  },

  challenges: {
    "pt-BR":
      "1) **Schedule timezone-aware**: enviar e-mail às 9h do horário do remetente exige converter slot pretendido para UTC e gravar `scheduledAt`. 2) **Rate limit por conta SMTP** sem mascarar — cada provider (Gmail, AWS SES, Mailgun) tem cap diferente; o worker mantém contador rolling por hora/dia. 3) **Variável substitution** em template HTML: o subject e o corpo aceitam `{{ first_name }}`, `{{ company }}` etc; injeção precisa ser à prova de XSS no admin e simples no template.",
    en: "1) **Timezone-aware schedule**: sending at 9am sender-local requires converting the intended slot to UTC and storing `scheduledAt`. 2) **Per-SMTP rate limit** without masking — each provider (Gmail, AWS SES, Mailgun) has a different cap; the worker keeps a rolling per-hour/per-day counter. 3) **Variable substitution** in HTML templates: subject and body accept `{{ first_name }}`, `{{ company }}` etc; injection must be XSS-safe on admin and simple in template.",
  },

  readme: {
    "pt-BR": `# 0mail — detalhamento técnico

0mail é o "Instantly self-hosted" do meu homelab — feito para enviar campanhas pessoais sem pagar SaaS comercial. O design prioriza simplicidade: dois processos, um Postgres, sem Redis, sem fila externa.

## Topologia

\`\`\`mermaid
flowchart LR
  USER["Operador"] -->|UI| APP["Next.js app<br/>:3000"]
  APP -->|CRUD| PG[("PostgreSQL")]
  WORKER["Worker Node<br/>poll 30s"] --> PG
  WORKER -->|"SMTP"| GMAIL["Gmail / SES / Mailgun<br/>(qualquer provider)"]
  GMAIL --> LEAD["Lead"]
\`\`\`

App e worker compartilham só o Postgres. Worker é stateless: reinicia sem perder envios em curso porque o estado está no DB.

## Schema principal

\`\`\`mermaid
erDiagram
  EmailAccount ||--o{ EmailMessage : sends
  Lead ||--o{ CampaignEnrollment : enrolled
  Campaign ||--o{ CampaignStep : has
  Campaign ||--o{ CampaignEnrollment : has
  CampaignEnrollment ||--o{ EmailMessage : generates
  CampaignStep ||--o{ EmailMessage : produces

  EmailAccount {
    string id
    string smtpHost
    int smtpPort
    string username
    string passwordEncrypted
    int dailyLimit
    string timezone
  }
  Campaign {
    string id
    string name
    json schedule
  }
  EmailMessage {
    string id
    string status
    datetime scheduledAt
    datetime sentAt
    string accountId
    string leadId
  }
\`\`\`

## Fluxo de envio

\`\`\`mermaid
sequenceDiagram
  participant W as Worker
  participant DB as Postgres
  participant SMTP as Provider SMTP
  participant L as Lead

  loop a cada 30s
    W->>DB: SELECT messages WHERE status='SCHEDULED' AND scheduledAt<=NOW()
    DB-->>W: lista
    loop cada mensagem
      W->>DB: checa rate-limit da conta SMTP (rolling hour/day)
      alt dentro do limite
        W->>SMTP: nodemailer.send(envelope)
        SMTP-->>L: e-mail entregue
        W->>DB: update status='SENT', sentAt=NOW()
      else excedeu
        W->>DB: re-schedule +1h
      end
    end
  end
\`\`\`

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 15 (App Router), shadcn/ui, Recharts |
| Estado client | TanStack Query 5 |
| Backend | Next.js API Routes |
| Banco | PostgreSQL 16 + Prisma 6 |
| Worker | Node.js process com polling Nodemailer |
| Deploy | Docker Compose (app + worker + db) |

## Decisões técnicas

- **Sem BullMQ/Redis**: 0mail é homelab, não SaaS público. Polling de 30s é suficiente e elimina toda uma stack.
- **Worker como processo separado**: escalar envio sem rebuildar o Next. Em produção, basta um \`docker compose up worker --scale=2\` se precisar de paralelismo.
- **Rate limit por conta, não global**: cada provider (Gmail, SES, Mailgun) tem cap próprio; rate limit global penalizaria contas com folga.
- **Dark mode default**: ferramenta interna, sem clientes externos. Zinc-based para parecer ferramenta dev, não app de produto.

## Defaults

- **Timezone**: America/Sao_Paulo (BRT)
- **Locale**: pt-BR
- **Schedule**: Seg-Sex 08:00–18:00 (configurável por campanha)
- **Worker poll**: 30s
- **Delay entre envios**: 2s (anti-burst)

## Limites e roadmap

- Tracking de abertura (pixel) — planejado
- Tracking de click (redirect) — planejado
- Warmup automático de contas novas — planejado
- A/B test de subject — planejado`,
    en: `# 0mail — technical deep dive

0mail is my homelab's "self-hosted Instantly" — built to run personal campaigns without paying a commercial SaaS. The design favors simplicity: two processes, one Postgres, no Redis, no external queue.

## Topology

\`\`\`mermaid
flowchart LR
  USER["Operator"] -->|UI| APP["Next.js app<br/>:3000"]
  APP -->|CRUD| PG[("PostgreSQL")]
  WORKER["Node worker<br/>poll 30s"] --> PG
  WORKER -->|"SMTP"| GMAIL["Gmail / SES / Mailgun<br/>(any provider)"]
  GMAIL --> LEAD["Lead"]
\`\`\`

App and worker share only Postgres. The worker is stateless: restart without losing in-flight sends because state lives in the DB.

## Core schema

\`\`\`mermaid
erDiagram
  EmailAccount ||--o{ EmailMessage : sends
  Lead ||--o{ CampaignEnrollment : enrolled
  Campaign ||--o{ CampaignStep : has
  Campaign ||--o{ CampaignEnrollment : has
  CampaignEnrollment ||--o{ EmailMessage : generates
  CampaignStep ||--o{ EmailMessage : produces

  EmailAccount {
    string id
    string smtpHost
    int smtpPort
    string username
    string passwordEncrypted
    int dailyLimit
    string timezone
  }
  Campaign {
    string id
    string name
    json schedule
  }
  EmailMessage {
    string id
    string status
    datetime scheduledAt
    datetime sentAt
    string accountId
    string leadId
  }
\`\`\`

## Send flow

\`\`\`mermaid
sequenceDiagram
  participant W as Worker
  participant DB as Postgres
  participant SMTP as SMTP Provider
  participant L as Lead

  loop every 30s
    W->>DB: SELECT messages WHERE status='SCHEDULED' AND scheduledAt<=NOW()
    DB-->>W: list
    loop each message
      W->>DB: check SMTP account rate-limit (rolling hour/day)
      alt within limit
        W->>SMTP: nodemailer.send(envelope)
        SMTP-->>L: email delivered
        W->>DB: update status='SENT', sentAt=NOW()
      else over limit
        W->>DB: re-schedule +1h
      end
    end
  end
\`\`\`

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router), shadcn/ui, Recharts |
| Client state | TanStack Query 5 |
| Backend | Next.js API Routes |
| DB | PostgreSQL 16 + Prisma 6 |
| Worker | Node.js process polling Nodemailer |
| Deploy | Docker Compose (app + worker + db) |

## Technical decisions

- **No BullMQ/Redis**: 0mail is homelab, not a public SaaS. 30s polling is enough and removes a whole stack.
- **Worker as separate process**: scale sending without rebuilding Next. In production, just \`docker compose up worker --scale=2\` if parallelism is needed.
- **Rate limit per account, not global**: each provider (Gmail, SES, Mailgun) has its own cap; global rate limiting would penalize accounts with headroom.
- **Default dark mode**: internal tool, no external customers. Zinc-based to feel like a dev tool, not a product app.

## Defaults

- **Timezone**: America/Sao_Paulo (BRT)
- **Locale**: pt-BR
- **Schedule**: Mon–Fri 08:00–18:00 (configurable per campaign)
- **Worker poll**: 30s
- **Delay between sends**: 2s (anti-burst)

## Limits and roadmap

- Open tracking (pixel) — planned
- Click tracking (redirect) — planned
- Auto warmup for new accounts — planned
- Subject A/B test — planned`,
  },

  features: [
    {
      title: { "pt-BR": "Contas SMTP múltiplas", en: "Multiple SMTP accounts" },
      description: {
        "pt-BR": "CRUD + teste de conexão + monitoramento de saúde por conta. Rate limit individual por provider.",
        en: "CRUD + connection test + per-account health monitoring. Individual rate limit per provider.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "Leads com import CSV", en: "Leads with CSV import" },
      description: {
        "pt-BR": "Import/export CSV, tags, filtros, busca. Variáveis (`{{first_name}}`, `{{company}}`) substituídas no envio.",
        en: "CSV import/export, tags, filters, search. Variables (`{{first_name}}`, `{{company}}`) substituted at send time.",
      },
      order: 2,
    },
    {
      title: { "pt-BR": "Campanhas multi-step", en: "Multi-step campaigns" },
      description: {
        "pt-BR": "Sequências de e-mail com delay entre steps. Editor HTML com variáveis. Schedule por timezone.",
        en: "Email sequences with delays between steps. HTML editor with variables. Schedule per timezone.",
      },
      order: 3,
    },
    {
      title: { "pt-BR": "Worker com rate limit", en: "Rate-limited worker" },
      description: {
        "pt-BR": "Processo Node separado fazendo polling de 30s. Rolling counter por hora/dia por conta.",
        en: "Separate Node process polling every 30s. Rolling per-hour/per-day counter per account.",
      },
      order: 4,
    },
    {
      title: { "pt-BR": "Dashboard de analytics", en: "Analytics dashboard" },
      description: {
        "pt-BR": "Gráficos de envios por dia, conta e campanha. Atividade recente em tempo real.",
        en: "Sends per day/account/campaign charts. Recent activity in near-real-time.",
      },
      order: 5,
    },
  ],

  decisions: [
    {
      title: { "pt-BR": "Polling em vez de BullMQ", en: "Polling instead of BullMQ" },
      reason: { "pt-BR": "Volume homelab não justifica Redis", en: "Homelab volume doesn't justify Redis" },
      description: {
        "pt-BR":
          "30s de latência é aceitável para cold email. Remove uma stack inteira (Redis + BullMQ) sem perda real.",
        en: "30s latency is acceptable for cold email. Removes an entire stack (Redis + BullMQ) with no real loss.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "Worker stateless", en: "Stateless worker" },
      reason: { "pt-BR": "Todo estado no Postgres = restart trivial", en: "All state in Postgres = trivial restart" },
      description: {
        "pt-BR":
          "Worker pode morrer, redeploy ou escalar sem perder mensagens — Postgres é a fonte da verdade.",
        en: "Worker can die, redeploy or scale without losing messages — Postgres is the source of truth.",
      },
      order: 2,
    },
  ],
};
