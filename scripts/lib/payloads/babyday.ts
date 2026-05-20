import type { ProjectPayload } from "../project-upsert";

export const babyday: ProjectPayload = {
  slug: "babyday",
  title: "BabyDay",
  shortDescription:
    "App para casais registrarem rotinas do bebê (sono, alimentação, troca) com gráficos de evolução e múltiplos cuidadores.",
  category: "fullstack",
  status: "shipped",
  year: 2026,
  featured: false,
  order: 5,
  demoUrl: "https://babyday-inky.vercel.app",
  githubUrl: "https://github.com/devalexsantos/babyday",
  techSlugs: [
    "nextjs",
    "typescript",
    "react",
    "tailwindcss",
    "prisma",
    "postgresql",
    "zod",
  ],

  content: {
    "pt-BR": {
      fullDescription:
        "BabyDay é um app web para casais e cuidadores acompanharem as rotinas do bebê em tempo compartilhado: sono, mamada, troca de fralda, banho, medicação. Tudo entra com um clique no celular e aparece imediatamente nos gráficos de evolução. Auth com NextAuth + Prisma adapter, validação com Zod, gráficos com Recharts.",
      problem:
        "Recém-nascido exige rotina coordenada entre vários adultos (pai, mãe, avós, babá). Anotar no papel se perde; planilha exige disciplina; apps existentes ou são pagos, lentos, ou cheios de propaganda. Falta uma ferramenta simples que sincronize entre cuidadores e mostre tendências.",
      hypothesis:
        "Se o registro for de UM clique e a tela inicial mostrar o estado atual ('última mamada há 2h, último sono há 30min'), o casal usa todo dia e em pouco tempo tem dados suficientes para detectar padrões — picos de cólica, regressão de sono, intervalos curtos de mamada.",
      targetAudience:
        "Pais de primeira viagem com bebê de 0 a 12 meses, em fase de rotina ainda instável. Famílias com múltiplos cuidadores ativos (avós, babá), onde a coordenação é o maior valor.",
      technicalDecisions:
        "Stack minimalista para um app pessoal: Next.js App Router para rapidez no MVP, Prisma + Postgres como source-of-truth, NextAuth com adapter de Prisma e bcrypt para login email/senha. Recharts para gráficos pelo bundle pequeno e API limpa. date-fns + date-fns-tz para lidar com fuso horário (entrada em pt-BR, gráficos por dia local).",
      learnings:
        "Implementar isolamento por 'Family' (múltiplos cuidadores compartilhando um bebê) sem complicar a UI exigiu modelar Family → User → Baby cuidadosamente. O segundo grande aprendizado foi: gráfico de sono precisa de granularidade por minuto, mas tela de rotina precisa de granularidade por hora — duas views da mesma tabela.",
      nextSteps:
        "Notificações push quando a janela esperada de mamada passar; exportar relatório em PDF para mostrar ao pediatra; integração com balança Bluetooth para registrar peso automaticamente.",
    },
    en: {
      fullDescription:
        "BabyDay is a web app for couples and caregivers to log a baby's routines in shared time: sleep, feeding, diaper changes, bath, medication. One tap on the phone and it shows up immediately in the evolution charts. Auth via NextAuth + Prisma adapter, validation with Zod, charts with Recharts.",
      problem:
        "A newborn requires coordinated routines across multiple adults (mom, dad, grandparents, nanny). Paper notes get lost; spreadsheets need discipline; existing apps are paid, slow, or ad-heavy. There's no simple tool that syncs across caregivers and surfaces trends.",
      hypothesis:
        "If logging is one tap and the home screen shows current state ('last feed 2h ago, last sleep 30min ago'), the couple uses it daily and quickly collects enough data to spot patterns — colic peaks, sleep regression, short feed gaps.",
      targetAudience:
        "First-time parents with babies aged 0–12 months, still in an unstable routine phase. Families with multiple active caregivers (grandparents, nanny) where coordination is the biggest value.",
      technicalDecisions:
        "Minimal stack for a personal app: Next.js App Router for MVP speed, Prisma + Postgres as the source of truth, NextAuth with Prisma adapter and bcrypt for email/password login. Recharts for charts thanks to its small bundle and clean API. date-fns + date-fns-tz to handle timezones (input in pt-BR, charts in local day).",
      learnings:
        "Isolating by 'Family' (multiple caregivers sharing a baby) without bloating the UI required modeling Family → User → Baby carefully. The second big lesson: sleep charts need per-minute granularity, but routine view needs per-hour — two views of the same table.",
      nextSteps:
        "Push notifications when the expected feed window passes; export PDF report for the pediatrician; Bluetooth scale integration for automatic weight logging.",
    },
  },

  architecture: {
    "pt-BR":
      "Aplicação Next.js 15 single-tier com App Router. Modelagem multi-tenant leve: cada `User` pertence a uma `Family`, e `Baby` é filho da `Family`. Todos os eventos (Sleep, Feed, Diaper, Bath, Medication) referenciam Baby + User (quem registrou), permitindo histórico e auditoria. Server Actions cuidam de mutações; queries usam Server Components diretos. NextAuth com Credentials provider (email/senha hash bcrypt) — magic link estava no plano mas foi cortado para reduzir dependência de SMTP.",
    en: "Single-tier Next.js 15 app with App Router. Lightweight multi-tenant model: each `User` belongs to a `Family`, and `Baby` is a child of the `Family`. All events (Sleep, Feed, Diaper, Bath, Medication) reference Baby + User (who logged it), enabling history and audit. Server Actions handle mutations; queries use Server Components directly. NextAuth with Credentials provider (email/password bcrypt hashing) — magic link was planned but cut to reduce SMTP dependency.",
  },

  challenges: {
    "pt-BR":
      "1) **Sincronização entre dispositivos** sem WebSocket: o app revalida quando volta ao foreground, o que cobre 95% dos casos sem complicar a infra. 2) **Modelagem do sono** que pode atravessar a meia-noite (bebê dorme 23h-7h) sem quebrar agregações diárias. 3) **Convite para novo cuidador** entrando na mesma Family — token com expiração + endpoint público que cria User vinculado.",
    en: "1) **Cross-device sync** without WebSockets: the app revalidates when it returns to foreground, covering 95% of cases without infra complexity. 2) **Modeling sleep** that may cross midnight (baby sleeps 11pm-7am) without breaking daily aggregations. 3) **Inviting a new caregiver** to the same Family — expiring token + public endpoint that creates the linked User.",
  },

  readme: {
    "pt-BR": `# BabyDay — detalhamento técnico

BabyDay é o app mais "doméstico" do portfólio — feito para a minha família e amigos próximos. Apesar do escopo enxuto, ele resolve um problema real de coordenação entre pai, mãe, avós e babá, com sincronização quase instantânea e gráficos que ajudam a detectar padrões nos primeiros meses.

## Modelo de dados

\`\`\`mermaid
erDiagram
  Family ||--o{ User : has
  Family ||--o{ Baby : has
  Baby ||--o{ SleepEvent : has
  Baby ||--o{ FeedEvent : has
  Baby ||--o{ DiaperEvent : has
  Baby ||--o{ MedicationEvent : has
  User  ||--o{ SleepEvent : "logged_by"
  User  ||--o{ FeedEvent : "logged_by"

  Family {
    string id
    string name
    datetime createdAt
  }
  Baby {
    string id
    string familyId
    string name
    datetime bornAt
  }
  SleepEvent {
    string id
    string babyId
    string userId
    datetime startedAt
    datetime endedAt
  }
\`\`\`

A escolha de uma tabela por tipo de evento (em vez de uma genérica com \`type\` enum) facilita queries específicas para cada gráfico e cada uma evolui com colunas próprias (\`FeedEvent\` tem \`amountMl\`, \`SleepEvent\` tem \`startedAt + endedAt\`, etc.).

## Fluxo de registro rápido

\`\`\`mermaid
sequenceDiagram
  participant P as Pai/Mãe (PWA)
  participant A as App (Next.js)
  participant DB as Postgres

  P->>A: tap "Mamada"
  A->>A: pré-preenche timestamp = agora
  A->>DB: cria FeedEvent (Server Action)
  DB-->>A: ok
  A-->>P: toast + atualiza "última mamada" no header
  Note over A: revalidatePath('/') propaga para Server Components
\`\`\`

## Estrutura de pastas

\`\`\`
babyday/
├── app/
│   ├── (auth)/login/
│   ├── (app)/                  # área autenticada
│   │   ├── dashboard/          # estado atual + ações rápidas
│   │   ├── historico/          # timeline + gráficos
│   │   ├── familia/            # cuidadores + convite
│   │   └── bebe/[id]/          # perfil do bebê
│   └── api/auth/[...nextauth]/
├── actions/                    # Server Actions
├── components/                 # UI (shadcn + custom)
├── lib/                        # prisma, auth, helpers
├── validations/                # Zod schemas
└── prisma/schema.prisma
\`\`\`

## Convite de cuidador

\`\`\`mermaid
flowchart LR
  ADMIN["Mãe (admin da Family)"] -->|"gera convite"| TOKEN["Token UUID + expira em 7d"]
  TOKEN -->|link/whatsapp| INVITED["Avó recebe link"]
  INVITED -->|"clica"| ROUTE["/convite/[token]"]
  ROUTE -->|"valida"| NEW_USER["cria User + bcrypt senha"]
  NEW_USER -->|"vincula"| FAM["Family existente"]
\`\`\`

## Decisões técnicas

| Decisão | Por quê |
|---|---|
| **Uma tabela por tipo de evento** | Cada gráfico precisa de campos próprios; \`enum type\` em tabela única vira spaghetti. |
| **NextAuth Credentials, não magic link** | Reduz dependência de SMTP num projeto sem orçamento de infra. |
| **Sem WebSocket** | revalidate on focus cobre o caso real (pai marca evento → mãe abre o app depois); WebSocket seria over-engineering. |
| **date-fns-tz** | Gráficos precisam respeitar o fuso local; o servidor está em UTC. |
| **Recharts** | API declarativa que combina bem com Server Components; bundle aceitável. |

## Roadmap

- Push notifications quando a próxima mamada estiver atrasada
- Export PDF para consulta pediátrica
- Integração com balança Bluetooth para peso/altura
- Modo "babá temporária" com escopo de eventos limitado`,
    en: `# BabyDay — technical deep dive

BabyDay is the most "domestic" app in this portfolio — built for my own family and close friends. Despite the small scope, it solves a real coordination problem across mom, dad, grandparents and nanny, with near-instant sync and charts that help spot patterns in the first months.

## Data model

\`\`\`mermaid
erDiagram
  Family ||--o{ User : has
  Family ||--o{ Baby : has
  Baby ||--o{ SleepEvent : has
  Baby ||--o{ FeedEvent : has
  Baby ||--o{ DiaperEvent : has
  Baby ||--o{ MedicationEvent : has
  User  ||--o{ SleepEvent : "logged_by"
  User  ||--o{ FeedEvent : "logged_by"

  Family {
    string id
    string name
    datetime createdAt
  }
  Baby {
    string id
    string familyId
    string name
    datetime bornAt
  }
  SleepEvent {
    string id
    string babyId
    string userId
    datetime startedAt
    datetime endedAt
  }
\`\`\`

Choosing one table per event type (instead of a generic one with a \`type\` enum) makes specific queries easier and each table grows its own columns (\`FeedEvent\` has \`amountMl\`, \`SleepEvent\` has \`startedAt + endedAt\`, etc.).

## Fast-logging flow

\`\`\`mermaid
sequenceDiagram
  participant P as Parent (PWA)
  participant A as App (Next.js)
  participant DB as Postgres

  P->>A: tap "Feed"
  A->>A: prefill timestamp = now
  A->>DB: create FeedEvent (Server Action)
  DB-->>A: ok
  A-->>P: toast + updates "last feed" in header
  Note over A: revalidatePath('/') propagates to Server Components
\`\`\`

## Folder structure

\`\`\`
babyday/
├── app/
│   ├── (auth)/login/
│   ├── (app)/                  # auth-gated area
│   │   ├── dashboard/          # current state + quick actions
│   │   ├── historico/          # timeline + charts
│   │   ├── familia/            # caregivers + invite
│   │   └── bebe/[id]/          # baby profile
│   └── api/auth/[...nextauth]/
├── actions/                    # Server Actions
├── components/                 # UI (shadcn + custom)
├── lib/                        # prisma, auth, helpers
├── validations/                # Zod schemas
└── prisma/schema.prisma
\`\`\`

## Caregiver invite

\`\`\`mermaid
flowchart LR
  ADMIN["Mom (Family admin)"] -->|"create invite"| TOKEN["UUID token, expires in 7d"]
  TOKEN -->|link/whatsapp| INVITED["Grandma gets the link"]
  INVITED -->|"clicks"| ROUTE["/convite/[token]"]
  ROUTE -->|"validates"| NEW_USER["creates User + bcrypt password"]
  NEW_USER -->|"links to"| FAM["existing Family"]
\`\`\`

## Technical decisions

| Decision | Why |
|---|---|
| **One table per event type** | Each chart needs its own fields; a single table with \`enum type\` becomes spaghetti. |
| **NextAuth Credentials, not magic link** | Reduces SMTP dependency for a no-infra-budget project. |
| **No WebSocket** | revalidate-on-focus covers the real case (parent logs event → mom opens app later); WS would be overkill. |
| **date-fns-tz** | Charts must respect local timezone; the server is UTC. |
| **Recharts** | Declarative API pairs well with Server Components; bundle is acceptable. |

## Roadmap

- Push notifications when the next feed window is overdue
- PDF export for pediatric visits
- Bluetooth scale integration for weight/height
- "Temporary nanny" mode with limited event scope`,
  },

  features: [
    {
      title: { "pt-BR": "Registro em um toque", en: "One-tap logging" },
      description: {
        "pt-BR":
          "Botões grandes para sono, mamada, troca, banho e medicação. Timestamp pré-preenchido = agora.",
        en: "Big buttons for sleep, feed, diaper, bath and medication. Timestamp prefilled to now.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "Múltiplos cuidadores na mesma Family", en: "Multiple caregivers in the same Family" },
      description: {
        "pt-BR":
          "Convite por link com token. Todos veem os mesmos eventos em tempo quase real (revalidate on focus).",
        en: "Invite by link with token. Everyone sees the same events in near real time (revalidate on focus).",
      },
      order: 2,
    },
    {
      title: { "pt-BR": "Gráficos de evolução", en: "Evolution charts" },
      description: {
        "pt-BR":
          "Sono por dia, mamadas por intervalo, trocas por turno. Recharts com cores acessíveis no escuro.",
        en: "Sleep per day, feeds per interval, diapers per shift. Recharts with dark-mode accessible colors.",
      },
      order: 3,
    },
    {
      title: { "pt-BR": "Estado 'agora' no header", en: "'Now' state in the header" },
      description: {
        "pt-BR":
          "Cabeçalho sempre mostra 'última mamada há X' e 'último sono há Y', a pergunta mais frequente entre cuidadores.",
        en: "Header always shows 'last feed X ago' and 'last sleep Y ago' — the most common question between caregivers.",
      },
      order: 4,
    },
  ],

  decisions: [
    {
      title: { "pt-BR": "Tabela por tipo de evento", en: "Table per event type" },
      reason: { "pt-BR": "Cada evento tem campos próprios", en: "Each event has its own fields" },
      description: {
        "pt-BR":
          "Em vez de uma tabela genérica com `type` enum + JSON, cada evento tem schema dedicado. Queries ficam claras e os índices funcionam direito.",
        en: "Instead of a generic table with `type` enum + JSON, each event has its own schema. Queries stay clear and indexes work properly.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "Sem WebSocket", en: "No WebSocket" },
      reason: { "pt-BR": "Revalidate on focus cobre o caso real", en: "Revalidate-on-focus covers the real case" },
      description: {
        "pt-BR":
          "Cuidadores não ficam olhando a mesma tela simultaneamente. Quando o segundo abre o app, ele revalida — basta.",
        en: "Caregivers don't watch the same screen simultaneously. When the second one opens the app, it revalidates — that's enough.",
      },
      order: 2,
    },
  ],
};
