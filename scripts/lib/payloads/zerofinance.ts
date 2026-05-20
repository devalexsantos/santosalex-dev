import type { ProjectPayload } from "../project-upsert";

export const zerofinance: ProjectPayload = {
  slug: "0finance",
  title: "0finance",
  shortDescription:
    "Dashboard financeiro pessoal self-hosted — contas, transações, categorias, recorrências e gráficos de fluxo mensal.",
  category: "saas",
  status: "shipped",
  year: 2026,
  featured: false,
  order: 9,
  demoUrl: null,
  githubUrl: "https://github.com/devalexsantos/0finance",
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
        "0finance é um dashboard financeiro pessoal self-hosted: cadastro de contas (corrente, poupança, cartão), lançamento de transações, categorias hierárquicas, recorrências automáticas (salário, conta de luz), gráficos de fluxo mensal/anual com Recharts, e tema dark por padrão. Tudo em Next.js 15 com App Router, Server Actions, dnd-kit para reordenar categorias.",
      problem:
        "Apps de finanças pessoais comerciais (Organizze, Mobills) cobram mensalidade e exigem sincronização bancária via Open Banking — muita gente prefere lançar manualmente e ter controle total dos dados. Excel é flexível mas não mostra fluxo bonito. Faltava o meio-termo self-hosted.",
      hypothesis:
        "Se eu fizer um app de lançamento manual rápido (atalhos de teclado, recorrências, categorias pré-criadas), com gráficos claros de fluxo, gente que valoriza privacidade adota — e eu uso pra mim mesmo.",
      targetAudience:
        "Eu mesmo (primeiro usuário) e pessoas que querem dashboard financeiro local sem dar acesso a Open Banking ou pagar SaaS. Profissionais técnicos com homelab.",
      technicalDecisions:
        "Next.js 15 single-tier (sem worker, sem fila). Prisma 6 + PostgreSQL 16. NextAuth com Credentials (uso pessoal, sem fluxo de signup). React Hook Form + Zod nos formulários. Recharts para gráficos. react-day-picker para seletor de datas. next-themes (mas tema dark default — light é exceção).",
      learnings:
        "Recorrências (salário no 5º útil, conta de luz no dia 10) são modeladas como uma tabela separada `RecurringTransaction` com um job leve que materializa transações futuras. Categorias hierárquicas com dnd-kit precisaram de um pequeno trie em memória para evitar requests por arraste.",
      nextSteps:
        "Import de extrato OFX (formato bancário padrão); metas mensais por categoria com alertas; comparação de orçamento previsto vs. realizado; export para Excel/CSV.",
    },
    en: {
      fullDescription:
        "0finance is a self-hosted personal finance dashboard: account registry (checking, savings, credit card), transaction entry, hierarchical categories, automated recurrences (salary, utilities), monthly/yearly cashflow charts with Recharts, and default dark theme. All in Next.js 15 with App Router, Server Actions, dnd-kit for category reordering.",
      problem:
        "Commercial personal finance apps (Organizze, Mobills) charge a subscription and require bank sync via Open Banking — many prefer manual entry and full data control. Excel is flexible but doesn't render nice cashflow. The self-hosted middle ground was missing.",
      hypothesis:
        "Build an app with fast manual entry (keyboard shortcuts, recurrences, pre-created categories) and clear cashflow charts, and privacy-minded folks adopt — plus I use it myself.",
      targetAudience:
        "Myself (first user) and people who want a local financial dashboard without giving Open Banking access or paying SaaS. Technical folks with a homelab.",
      technicalDecisions:
        "Single-tier Next.js 15 (no worker, no queue). Prisma 6 + PostgreSQL 16. NextAuth with Credentials (personal use, no signup flow). React Hook Form + Zod in forms. Recharts for charts. react-day-picker for date selection. next-themes (but dark is default — light is the exception).",
      learnings:
        "Recurrences (salary on 5th business day, utility on day 10) are modeled as a separate `RecurringTransaction` table with a light job materializing future transactions. Hierarchical categories with dnd-kit needed a small in-memory trie to avoid requests per drag.",
      nextSteps:
        "OFX statement import (bank standard format); per-category monthly budgets with alerts; planned vs. actual comparison; Excel/CSV export.",
    },
  },

  architecture: {
    "pt-BR":
      "App Next.js 15 single-tier sem worker dedicado. Recorrências são materializadas em transações futuras por um Server Action chamado no app start ou em endpoint cron-friendly (`/api/cron/materialize`). Schema central: `Account` (corrente/poupança/cartão), `Transaction` (entrada/saída/transferência), `Category` (hierárquica via `parentId`), `RecurringTransaction` (template + regra). Tudo no Postgres com Prisma. UI shadcn + tema dark default.",
    en: "Single-tier Next.js 15 app, no dedicated worker. Recurrences are materialized into future transactions by a Server Action called at app start or via a cron-friendly endpoint (`/api/cron/materialize`). Core schema: `Account` (checking/savings/credit card), `Transaction` (income/expense/transfer), `Category` (hierarchical via `parentId`), `RecurringTransaction` (template + rule). All in Postgres with Prisma. shadcn UI + default dark theme.",
  },

  challenges: {
    "pt-BR":
      "1) **Recorrência com regras flexíveis** (todo 5º dia útil, todo dia 10, anual em X). Resolvi com um pequeno DSL de regra serializada como JSON na coluna `rule`, parseada por uma função pura. 2) **Categorias hierárquicas com dnd-kit** sem flickering — trie em memória + batching de updates. 3) **Importar OFX corretamente** (planejado) exige detectar duplicatas — mesma data + mesmo valor não é necessariamente a mesma transação.",
    en: "1) **Recurrence with flexible rules** (every 5th business day, every day 10, yearly on X). Solved with a small rule DSL serialized as JSON in the `rule` column, parsed by a pure function. 2) **Hierarchical categories with dnd-kit** without flickering — in-memory trie + batched updates. 3) **OFX import** (planned) needs duplicate detection — same date + same amount isn't necessarily the same transaction.",
  },

  readme: {
    "pt-BR": `# 0finance — detalhamento técnico

0finance é dashboard financeiro pessoal — feito para eu rodar no meu homelab, sem Open Banking, sem mensalidade. O foco é UX rápido de lançamento manual e fluxo de caixa visual.

## Topologia

\`\`\`mermaid
flowchart LR
  USER["Usuário"] --> APP["Next.js 15<br/>App Router"]
  APP --> PG[("PostgreSQL")]
  CRON["Cron (opcional)<br/>e.g. EasyPanel"] --> APP
  APP -->|"materialize"| PG
\`\`\`

Stack mínima: app + DB. Sem worker, sem Redis, sem fila. Cron externo (ou interno via Server Action no startup) materializa recorrências.

## Schema

\`\`\`mermaid
erDiagram
  Account ||--o{ Transaction : has
  Category ||--o{ Transaction : classifies
  Category ||--o{ Category : "parent"
  Account ||--o{ RecurringTransaction : produces
  Category ||--o{ RecurringTransaction : classifies
  RecurringTransaction ||--o{ Transaction : materializes

  Account {
    string id
    string name
    enum type
    decimal initialBalance
  }
  Transaction {
    string id
    string accountId
    string categoryId
    decimal amount
    enum kind
    datetime date
  }
  Category {
    string id
    string name
    string parentId
    string color
    int order
  }
  RecurringTransaction {
    string id
    json rule
    decimal amount
    string accountId
    string categoryId
  }
\`\`\`

## DSL de recorrência

\`\`\`json
{ "type": "monthly", "day": 10 }
{ "type": "businessDay", "n": 5 }
{ "type": "yearly", "month": 12, "day": 13 }
{ "type": "weekly", "weekday": "FRI" }
\`\`\`

Cada rule é interpretada por uma função pura \`nextOccurrence(rule, fromDate)\` que retorna a próxima data. O materializer é um loop: para cada recurring, calcular próximas N ocorrências dentro de uma janela e inserir transações se ainda não existirem.

## Fluxo de materialização

\`\`\`mermaid
sequenceDiagram
  participant CRON as Cron / Startup
  participant API as /api/cron/materialize
  participant DB as Postgres

  CRON->>API: POST (com bearer interno)
  API->>DB: SELECT RecurringTransaction
  loop cada recorrência
    API->>API: nextOccurrence dentro da janela (90 dias)
    loop cada data calculada
      API->>DB: existe Transaction com (recurringId, date)?
      alt não
        API->>DB: insert Transaction
      end
    end
  end
\`\`\`

## Categorias hierárquicas com dnd-kit

Categoria tem \`parentId\` (\`null\` = raiz). dnd-kit faz drag&drop multinível. Mover uma categoria filho para outra raiz dispara um único PATCH; o front mantém trie em memória para evitar request por arraste intermediário.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | Base UI + shadcn + Tailwind 4 |
| Tema | next-themes (dark default) |
| Formulários | RHF + Zod |
| DnD | dnd-kit |
| Datas | react-day-picker + date-fns |
| Gráficos | Recharts |
| Banco | PostgreSQL + Prisma 6 |
| Deploy | Docker multi-stage + entrypoint com migrate |

## Decisões técnicas

- **Sem worker dedicado**: recorrência roda via endpoint cron — extremamente leve, qualquer scheduler externo serve.
- **DSL de regra como JSON**: evita explosão de colunas booleanas; \`nextOccurrence\` é pura e testável.
- **Categorias hierárquicas mas planas no DB**: \`parentId\` self-FK, sem materialized path; queries com recursive CTE quando precisa.
- **Tema dark por padrão**: app pessoal, sem cliente externo; minimiza esforço de design.

## Roadmap

- Import OFX com detecção de duplicata
- Metas mensais por categoria com alertas
- Comparação previsto vs. realizado
- Export CSV/Excel`,
    en: `# 0finance — technical deep dive

0finance is a personal finance dashboard — built to run in my homelab, no Open Banking, no subscription. The focus is fast manual entry UX and visual cashflow.

## Topology

\`\`\`mermaid
flowchart LR
  USER["User"] --> APP["Next.js 15<br/>App Router"]
  APP --> PG[("PostgreSQL")]
  CRON["Cron (optional)<br/>e.g. EasyPanel"] --> APP
  APP -->|"materialize"| PG
\`\`\`

Minimal stack: app + DB. No worker, no Redis, no queue. External cron (or internal via Server Action on startup) materializes recurrences.

## Schema

\`\`\`mermaid
erDiagram
  Account ||--o{ Transaction : has
  Category ||--o{ Transaction : classifies
  Category ||--o{ Category : "parent"
  Account ||--o{ RecurringTransaction : produces
  Category ||--o{ RecurringTransaction : classifies
  RecurringTransaction ||--o{ Transaction : materializes

  Account {
    string id
    string name
    enum type
    decimal initialBalance
  }
  Transaction {
    string id
    string accountId
    string categoryId
    decimal amount
    enum kind
    datetime date
  }
  Category {
    string id
    string name
    string parentId
    string color
    int order
  }
  RecurringTransaction {
    string id
    json rule
    decimal amount
    string accountId
    string categoryId
  }
\`\`\`

## Recurrence DSL

\`\`\`json
{ "type": "monthly", "day": 10 }
{ "type": "businessDay", "n": 5 }
{ "type": "yearly", "month": 12, "day": 13 }
{ "type": "weekly", "weekday": "FRI" }
\`\`\`

Each rule is interpreted by a pure \`nextOccurrence(rule, fromDate)\` function returning the next date. The materializer is a loop: for each recurring, compute the next N occurrences in a window and insert transactions if they don't exist yet.

## Materialization flow

\`\`\`mermaid
sequenceDiagram
  participant CRON as Cron / Startup
  participant API as /api/cron/materialize
  participant DB as Postgres

  CRON->>API: POST (with internal bearer)
  API->>DB: SELECT RecurringTransaction
  loop each recurrence
    API->>API: nextOccurrence within window (90 days)
    loop each computed date
      API->>DB: exists Transaction with (recurringId, date)?
      alt no
        API->>DB: insert Transaction
      end
    end
  end
\`\`\`

## Hierarchical categories with dnd-kit

Category has \`parentId\` (\`null\` = root). dnd-kit handles multi-level drag&drop. Moving a child to a different root fires a single PATCH; the front keeps an in-memory trie to avoid a request per intermediate drag.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | Base UI + shadcn + Tailwind 4 |
| Theme | next-themes (dark default) |
| Forms | RHF + Zod |
| DnD | dnd-kit |
| Dates | react-day-picker + date-fns |
| Charts | Recharts |
| DB | PostgreSQL + Prisma 6 |
| Deploy | Multi-stage Docker + entrypoint with migrate |

## Technical decisions

- **No dedicated worker**: recurrence runs via a cron endpoint — extremely light, any external scheduler works.
- **Rule DSL as JSON**: avoids boolean column explosion; \`nextOccurrence\` is pure and testable.
- **Hierarchical categories, flat in DB**: \`parentId\` self-FK, no materialized path; recursive CTE when needed.
- **Default dark theme**: personal app, no external client; minimal design effort.

## Roadmap

- OFX import with duplicate detection
- Per-category monthly budgets with alerts
- Planned vs. actual comparison
- CSV/Excel export`,
  },

  features: [
    {
      title: { "pt-BR": "Contas e transações", en: "Accounts and transactions" },
      description: {
        "pt-BR": "Conta corrente, poupança e cartão. Transações de entrada, saída e transferência entre contas.",
        en: "Checking, savings and credit card accounts. Income, expense and inter-account transfer transactions.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "Categorias hierárquicas", en: "Hierarchical categories" },
      description: {
        "pt-BR": "Categoria pai e filhos com cores próprias. dnd-kit para reordenar e re-aninhar.",
        en: "Parent and child categories with own colors. dnd-kit to reorder and re-nest.",
      },
      order: 2,
    },
    {
      title: { "pt-BR": "Recorrências automáticas", en: "Automatic recurrences" },
      description: {
        "pt-BR": "DSL de regra (5º dia útil, dia 10, anual). Materializa transações futuras via cron endpoint.",
        en: "Rule DSL (5th business day, day 10, yearly). Materializes future transactions via a cron endpoint.",
      },
      order: 3,
    },
    {
      title: { "pt-BR": "Gráficos de fluxo", en: "Cashflow charts" },
      description: {
        "pt-BR": "Recharts: entradas vs. saídas por mês, evolução por categoria, saldo acumulado por conta.",
        en: "Recharts: income vs. expense per month, per-category evolution, cumulative balance per account.",
      },
      order: 4,
    },
  ],

  decisions: [
    {
      title: { "pt-BR": "Sem worker dedicado", en: "No dedicated worker" },
      reason: { "pt-BR": "Recorrência cabe num cron endpoint leve", en: "Recurrence fits in a light cron endpoint" },
      description: {
        "pt-BR":
          "Materializar 90 dias futuros é O(n) trivial; rodar via worker dedicado seria over-engineering.",
        en: "Materializing the next 90 days is trivially O(n); a dedicated worker would be overkill.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "DSL de regra como JSON", en: "Rule DSL as JSON" },
      reason: { "pt-BR": "Tipos de recorrência são poucos e bem definidos", en: "Few well-defined recurrence types" },
      description: {
        "pt-BR":
          "Função pura `nextOccurrence(rule, from)` é fácil de testar. Adicionar novo tipo de regra é só estender o discriminated union.",
        en: "Pure `nextOccurrence(rule, from)` is easy to test. Adding a new rule type is just extending the discriminated union.",
      },
      order: 2,
    },
  ],
};
