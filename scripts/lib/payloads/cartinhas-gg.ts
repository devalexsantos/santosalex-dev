import type { ProjectPayload } from "../project-upsert";

export const cartinhasGg: ProjectPayload = {
  slug: "cartinhas-gg",
  title: "Cartinhas.GG",
  shortDescription:
    "Analytics do CBLOL com notas semanais de jogadores e coaches, cards estilizados por tier, comparações e gráficos de evolução.",
  category: "fullstack",
  status: "shipped",
  year: 2026,
  featured: true,
  order: 3,
  demoUrl: null,
  githubUrl: "https://github.com/devalexsantos/cartinhas",
  techSlugs: [
    "nextjs",
    "typescript",
    "react",
    "tailwindcss",
    "shadcnui",
    "prisma",
    "postgresql",
    "docker",
  ],

  content: {
    "pt-BR": {
      fullDescription:
        "Cartinhas.GG é uma plataforma de analytics do CBLOL inspirada no HLTV.org. Avalia semanalmente jogadores e coaches, atribuindo notas de 0 a 100 que definem tiers (BAGRE, MEDIANO, BOM, CRAQUE, GOD). Cada jogador ganha um 'card' colecionável com efeitos visuais por tier — glow, shimmer, bordas gradientes. Monorepo TurboRepo com site público + admin, dois apps Next.js 15 em containers Docker separados.",
      problem:
        "A cena de eSports do CBLOL tem dezenas de jogadores e poucos veículos com análise estatística profunda por semana. Fãs ficam dependentes de threads do Reddit e tweets para entender quem está performando. Coaches e times tampouco têm dashboard público comparativo.",
      hypothesis:
        "Se cada semana virar um conjunto de cards de jogadores com nota visível e tier colorido, fãs colecionam, compartilham e voltam toda terça (dia das partidas). O tier system gamifica o consumo de analytics sem cair em sensacionalismo.",
      targetAudience:
        "Fãs do CBLOL (público amplo, idade 16-35), creators que produzem conteúdo de e-sports e querem dados, e times/coaches que precisam de visibilidade.",
      technicalDecisions:
        "Monorepo TurboRepo com npm workspaces. Next.js 15 com App Router em ambos os apps (web em :3000, admin em :3001) — Server Components reduzem JS no público pesado de gráficos. PostgreSQL + Prisma 6 (singleton em `@cartinhas/database` package). Auth via NextAuth v5 (Auth.js) só no admin, com bcrypt + Credentials. Recharts para visualizações. Upload de fotos S3 com presigned URL + crop client-side.",
      learnings:
        "TurboRepo + workspaces escala bem quando há código compartilhado real (database, UI, types). Sem isso, vira complicação à toa. ISR com revalidate=3600 nas páginas públicas ajudou demais — o site mantém SEO forte sem pagar render por request.",
      nextSteps:
        "Sistema de palpites (fantasy CBLOL) com pontuação semanal; cards NFT/colecionáveis; integração com PandaScore para dados em tempo real; expansão para outras ligas (LCS, LEC).",
    },
    en: {
      fullDescription:
        "Cartinhas.GG is a Brazilian CBLOL e-sports analytics platform inspired by HLTV.org. It weekly rates players and coaches with 0-100 scores that map to tiers (BAGRE, MEDIANO, BOM, CRAQUE, GOD). Each player gets a collectible 'card' with tier-driven visual effects — glow, shimmer, gradient borders. TurboRepo monorepo with public site + admin, two Next.js 15 apps in separate Docker containers.",
      problem:
        "The CBLOL e-sports scene has dozens of players and few outlets producing deep weekly statistical analysis. Fans depend on Reddit threads and tweets to understand who's performing. Coaches and teams also lack a public comparative dashboard.",
      hypothesis:
        "If every week becomes a set of player cards with visible scores and colored tiers, fans collect, share and come back every Tuesday (match day). The tier system gamifies analytics consumption without slipping into sensationalism.",
      targetAudience:
        "CBLOL fans (broad audience, age 16-35), content creators in e-sports who want data, and teams/coaches looking for visibility.",
      technicalDecisions:
        "TurboRepo monorepo with npm workspaces. Next.js 15 with App Router in both apps (web on :3000, admin on :3001) — Server Components cut JS on the chart-heavy public side. PostgreSQL + Prisma 6 (singleton in `@cartinhas/database`). NextAuth v5 (Auth.js) only on the admin, with bcrypt + Credentials. Recharts for visualizations. S3 photo uploads with presigned URL + client-side crop.",
      learnings:
        "TurboRepo + workspaces scale well when there's real shared code (database, UI, types). Without it, it's complexity for its own sake. ISR with revalidate=3600 on public pages helped a lot — the site keeps strong SEO without rendering per request.",
      nextSteps:
        "Fantasy-CBLOL prediction system with weekly scoring; NFT-like collectible cards; PandaScore integration for live data; expansion to other leagues (LCS, LEC).",
    },
  },

  architecture: {
    "pt-BR":
      "Monorepo com `apps/web` e `apps/admin` independentes mas compartilhando schema, UI e tipos. Cinco packages compartilhados: `@cartinhas/database` (Prisma client singleton), `@cartinhas/types` (enums TypeScript), `@cartinhas/ui` (shadcn/Radix), `@cartinhas/utils` (cálculo de tier, slug, format) e `@cartinhas/config` (ESLint 9 flat config, TS, Tailwind, Prettier). Os dois apps rodam em containers Docker separados — cada um com Dockerfile multi-stage e output `standalone` do Next. PostgreSQL único compartilhado via env.",
    en: "Monorepo with `apps/web` and `apps/admin` independent but sharing schema, UI and types. Five shared packages: `@cartinhas/database` (Prisma singleton), `@cartinhas/types` (TypeScript enums), `@cartinhas/ui` (shadcn/Radix), `@cartinhas/utils` (tier calc, slug, format) and `@cartinhas/config` (ESLint 9 flat config, TS, Tailwind, Prettier). The two apps run in separate Docker containers — each with multi-stage Dockerfile and Next `standalone` output. Single shared PostgreSQL via env.",
  },

  challenges: {
    "pt-BR":
      "1) **Sistema de tiers visualmente distintos** sem virar 'rainbow soup' — cinco tiers com cores próprias (cinza, azul, verde, roxo, dourado) e efeitos crescentes (borda → glow → shimmer). 2) **Schema com 13 modelos relacionados** (Season → Split → Week, Team → Player/Coach, Player → Ratings + Stats + Awards) sem N+1 queries. 3) **Upload de fotos com crop** em S3 via presigned URL evitando exposição de credenciais. 4) **ISR em rotas dinâmicas** (jogadores, coaches, times, semanas) com `generateStaticParams` mas mantendo dados frescos a cada hora.",
    en: "1) **Visually distinct tier system** without becoming 'rainbow soup' — five tiers with their own colors (gray, blue, green, purple, gold) and escalating effects (border → glow → shimmer). 2) **Schema with 13 related models** (Season → Split → Week, Team → Player/Coach, Player → Ratings + Stats + Awards) avoiding N+1 queries. 3) **Photo upload with crop** to S3 via presigned URL keeping credentials off the client. 4) **ISR on dynamic routes** (players, coaches, teams, weeks) with `generateStaticParams` while keeping data fresh every hour.",
  },

  readme: {
    "pt-BR": `# Cartinhas.GG — detalhamento técnico

Cartinhas.GG é o projeto mais ambicioso em termos de complexidade de domínio: 13 modelos relacionais, sistema de tiers com efeitos visuais por classe, dois apps Next.js, monorepo TurboRepo e deploy em containers Docker separados.

## Topologia

\`\`\`mermaid
flowchart TB
  subgraph Public["Apps públicos"]
    WEB["apps/web<br/>Next.js 15 :3000"]
    ADMIN["apps/admin<br/>Next.js 15 :3001<br/>NextAuth v5"]
  end

  subgraph Shared["Packages compartilhados"]
    DB["@cartinhas/database<br/>Prisma client"]
    UI["@cartinhas/ui<br/>shadcn + Radix"]
    TYPES["@cartinhas/types"]
    UTILS["@cartinhas/utils<br/>tier, slug, format"]
    CONFIG["@cartinhas/config<br/>ESLint, TS, Tailwind"]
  end

  subgraph Infra["Infra"]
    PG[("PostgreSQL 16")]
    S3["AWS S3<br/>fotos"]
  end

  WEB --> DB
  ADMIN --> DB
  WEB --> UI
  ADMIN --> UI
  WEB --> UTILS
  ADMIN --> UTILS
  DB --> PG
  ADMIN -->|"presigned URL"| S3
\`\`\`

## Schema (parcial)

\`\`\`mermaid
erDiagram
  Season ||--o{ Split : has
  Split ||--o{ Week : has
  Week ||--o{ PlayerWeeklyRating : has
  Week ||--o{ CoachWeeklyRating : has
  Week ||--o{ WeeklyAward : has
  Week ||--o{ WeeklySelection : has
  Team ||--o{ Player : has
  Team ||--o{ Coach : has
  Player ||--o{ PlayerWeeklyRating : has
  Player ||--o{ PlayerStats : has
  Player ||--o{ Media : has

  Player {
    string id
    string name
    string slug
    enum position
    string teamId
  }
  PlayerWeeklyRating {
    string id
    string playerId
    string weekId
    int score
    enum tier
    string reason
  }
\`\`\`

## Sistema de tiers

Pontuação de 0 a 100, traduzida em cinco classes com cores próprias:

| Tier | Score | Cor | Efeitos no card |
|---|---|---|---|
| BAGRE | 0–59 | Cinza | Borda neutra |
| MEDIANO | 60–69 | Azul | Borda + glow leve |
| BOM | 70–79 | Verde | Borda + glow + shimmer suave |
| CRAQUE | 80–89 | Roxo | Borda gradiente + glow forte + shimmer |
| GOD | 90–100 | Dourado | Tudo acima + brilho animado |

A função \`getTierFromScore()\` vive em \`@cartinhas/utils\` para evitar divergência entre web e admin.

## Fluxo semanal (terça-feira)

\`\`\`mermaid
sequenceDiagram
  participant ADM as Admin (você)
  participant API as apps/admin
  participant DB as Postgres
  participant WEB as apps/web (ISR)

  Note over ADM: terça à noite, após CBLOL
  ADM->>API: cria Week + lança ratings
  API->>DB: insert PlayerWeeklyRating[]
  API->>DB: insert WeeklyAward, WeeklySelection
  Note over WEB: ISR revalidate=3600
  ADM->>WEB: trigger manual de revalidatePath
  WEB-->>FAN: novas notas + cards públicos
\`\`\`

## Página de jogador

\`\`\`mermaid
flowchart LR
  ROUTE["/jogadores/[slug]"] --> SSG["generateStaticParams<br/>(todos os slugs)"]
  ROUTE --> RSC["RSC busca PlayerStats + Ratings"]
  RSC --> CHART_SCORE["PlayerScoreChart<br/>(Recharts)"]
  RSC --> CHART_STATS["PlayerStatsChart<br/>KDA, CS/min, DPM"]
  RSC --> CARD["PlayerCard<br/>(efeitos por tier)"]
  RSC --> AWARDS["WeeklyAwards"]
\`\`\`

## Deploy

Cada app tem Dockerfile multi-stage com \`output: standalone\` do Next. No EasyPanel:

- **Servico web** → build context: \`.\`, dockerfile: \`apps/web/Dockerfile\`, porta 3000
- **Servico admin** → build context: \`.\`, dockerfile: \`apps/admin/Dockerfile\`, porta 3001
- Ambos compartilham \`DATABASE_URL\`; só admin tem \`AUTH_SECRET\` + \`AWS_S3_*\`

## Decisões técnicas

- **Monorepo só quando faz sentido**: 5 packages compartilhados (schema, UI, types, utils, config) justificam TurboRepo. Sem isso vira ferramenta a mais.
- **NextAuth v5 só no admin**: o web público não precisa de sessão; isso elimina cookie chatter e flash de auth.
- **Recharts em RSC**: bibliotecas de gráfico geralmente precisam de client; uso \`"use client"\` só nos wrappers, mantendo o resto Server.
- **Crop client-side antes do upload**: economiza banda no S3 e dá ao admin preview imediato.

## Roadmap

- Sistema de palpites (fantasy CBLOL) com pontuação semanal
- Cards colecionáveis tipo NFT (sem cripto)
- Integração PandaScore para dados em tempo real
- Expansão para LCS, LEC, LCK`,
    en: `# Cartinhas.GG — technical deep dive

Cartinhas.GG is the most ambitious project in terms of domain complexity: 13 relational models, a tier system with class-driven visuals, two Next.js apps, TurboRepo monorepo and deploy across separate Docker containers.

## Topology

\`\`\`mermaid
flowchart TB
  subgraph Public["Public apps"]
    WEB["apps/web<br/>Next.js 15 :3000"]
    ADMIN["apps/admin<br/>Next.js 15 :3001<br/>NextAuth v5"]
  end

  subgraph Shared["Shared packages"]
    DB["@cartinhas/database<br/>Prisma client"]
    UI["@cartinhas/ui<br/>shadcn + Radix"]
    TYPES["@cartinhas/types"]
    UTILS["@cartinhas/utils<br/>tier, slug, format"]
    CONFIG["@cartinhas/config<br/>ESLint, TS, Tailwind"]
  end

  subgraph Infra["Infra"]
    PG[("PostgreSQL 16")]
    S3["AWS S3<br/>photos"]
  end

  WEB --> DB
  ADMIN --> DB
  WEB --> UI
  ADMIN --> UI
  WEB --> UTILS
  ADMIN --> UTILS
  DB --> PG
  ADMIN -->|"presigned URL"| S3
\`\`\`

## Schema (partial)

\`\`\`mermaid
erDiagram
  Season ||--o{ Split : has
  Split ||--o{ Week : has
  Week ||--o{ PlayerWeeklyRating : has
  Week ||--o{ CoachWeeklyRating : has
  Week ||--o{ WeeklyAward : has
  Week ||--o{ WeeklySelection : has
  Team ||--o{ Player : has
  Team ||--o{ Coach : has
  Player ||--o{ PlayerWeeklyRating : has
  Player ||--o{ PlayerStats : has
  Player ||--o{ Media : has

  Player {
    string id
    string name
    string slug
    enum position
    string teamId
  }
  PlayerWeeklyRating {
    string id
    string playerId
    string weekId
    int score
    enum tier
    string reason
  }
\`\`\`

## Tier system

0–100 scoring, mapped into five classes with their own colors:

| Tier | Score | Color | Card effects |
|---|---|---|---|
| BAGRE | 0–59 | Gray | Neutral border |
| MEDIANO | 60–69 | Blue | Border + soft glow |
| BOM | 70–79 | Green | Border + glow + light shimmer |
| CRAQUE | 80–89 | Purple | Gradient border + strong glow + shimmer |
| GOD | 90–100 | Gold | All above + animated shine |

\`getTierFromScore()\` lives in \`@cartinhas/utils\` to avoid drift between web and admin.

## Weekly flow (Tuesday)

\`\`\`mermaid
sequenceDiagram
  participant ADM as Admin (you)
  participant API as apps/admin
  participant DB as Postgres
  participant WEB as apps/web (ISR)

  Note over ADM: Tuesday night, after CBLOL
  ADM->>API: creates Week + posts ratings
  API->>DB: insert PlayerWeeklyRating[]
  API->>DB: insert WeeklyAward, WeeklySelection
  Note over WEB: ISR revalidate=3600
  ADM->>WEB: manual revalidatePath trigger
  WEB-->>FAN: new scores + public cards
\`\`\`

## Player page

\`\`\`mermaid
flowchart LR
  ROUTE["/jogadores/[slug]"] --> SSG["generateStaticParams<br/>(all slugs)"]
  ROUTE --> RSC["RSC fetches PlayerStats + Ratings"]
  RSC --> CHART_SCORE["PlayerScoreChart<br/>(Recharts)"]
  RSC --> CHART_STATS["PlayerStatsChart<br/>KDA, CS/min, DPM"]
  RSC --> CARD["PlayerCard<br/>(tier effects)"]
  RSC --> AWARDS["WeeklyAwards"]
\`\`\`

## Deploy

Each app has a multi-stage Dockerfile with Next \`output: standalone\`. On EasyPanel:

- **Web service** → build context: \`.\`, dockerfile: \`apps/web/Dockerfile\`, port 3000
- **Admin service** → build context: \`.\`, dockerfile: \`apps/admin/Dockerfile\`, port 3001
- Both share \`DATABASE_URL\`; only admin has \`AUTH_SECRET\` + \`AWS_S3_*\`

## Technical decisions

- **Monorepo only when it pays off**: 5 shared packages (schema, UI, types, utils, config) justify TurboRepo. Without that it's just extra tooling.
- **NextAuth v5 only on admin**: public web doesn't need a session; this avoids cookie chatter and auth flash.
- **Recharts in RSC**: chart libraries usually need client; I mark only the wrappers \`"use client"\` and keep the rest Server.
- **Client-side crop before upload**: saves S3 bandwidth and gives admin an immediate preview.

## Roadmap

- Fantasy CBLOL prediction system with weekly scoring
- NFT-like collectible cards (no crypto)
- PandaScore integration for live data
- Expansion to LCS, LEC, LCK`,
  },

  features: [
    {
      title: { "pt-BR": "Cards de jogadores por tier", en: "Tier-styled player cards" },
      description: {
        "pt-BR":
          "Cinco tiers com cores próprias e efeitos crescentes: borda → glow → shimmer → brilho dourado animado.",
        en: "Five tiers with own colors and escalating effects: border → glow → shimmer → animated golden shine.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "Comparação lado a lado", en: "Side-by-side comparison" },
      description: {
        "pt-BR":
          "Página `/comparar` com jogadores ou coaches lado a lado: scores, stats e radar chart.",
        en: "`/comparar` page with players or coaches side-by-side: scores, stats and radar chart.",
      },
      order: 2,
    },
    {
      title: { "pt-BR": "Gráficos de evolução", en: "Evolution charts" },
      description: {
        "pt-BR":
          "Recharts: score por semana, KDA, CS/min, DPM. Wrappers marcados `\"use client\"`; resto fica em RSC.",
        en: "Recharts: score per week, KDA, CS/min, DPM. Wrappers marked `\"use client\"`; rest stays in RSC.",
      },
      order: 3,
    },
    {
      title: { "pt-BR": "Painel admin completo", en: "Full admin panel" },
      description: {
        "pt-BR":
          "CRUD para times, jogadores, coaches, semanas e ratings. Upload de fotos com crop e S3 presigned URL.",
        en: "CRUD for teams, players, coaches, weeks and ratings. Photo upload with crop and S3 presigned URL.",
      },
      order: 4,
    },
    {
      title: { "pt-BR": "ISR + generateStaticParams", en: "ISR + generateStaticParams" },
      description: {
        "pt-BR":
          "Páginas dinâmicas pré-renderizam todos os slugs e revalidam a cada hora. SEO forte + dados frescos.",
        en: "Dynamic pages pre-render all slugs and revalidate hourly. Strong SEO + fresh data.",
      },
      order: 5,
    },
  ],

  decisions: [
    {
      title: { "pt-BR": "Dois apps Next no monorepo", en: "Two Next apps in the monorepo" },
      reason: { "pt-BR": "Separa concerns públicos de admin sem duplicar código", en: "Splits public from admin without duplicating code" },
      description: {
        "pt-BR":
          "`apps/web` (público, sem auth) e `apps/admin` (autenticado, upload). Packages compartilhados evitam duplicação de schema, UI e utils.",
        en: "`apps/web` (public, no auth) and `apps/admin` (authenticated, uploads). Shared packages avoid duplicating schema, UI and utils.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "ISR com revalidate=3600", en: "ISR with revalidate=3600" },
      reason: { "pt-BR": "Dados novos só toda terça; render por request é desperdício", en: "New data only on Tuesdays; per-request render is wasteful" },
      description: {
        "pt-BR":
          "1h é mais que suficiente para o ritmo de update do CBLOL e mantém SEO + custo de servidor mínimo.",
        en: "1h is plenty for CBLOL update cadence and keeps SEO + server cost minimal.",
      },
      order: 2,
    },
    {
      title: { "pt-BR": "S3 presigned URL para upload", en: "S3 presigned URL for upload" },
      reason: { "pt-BR": "Cliente faz upload direto sem trafegar pelo Next", en: "Client uploads directly without going through Next" },
      description: {
        "pt-BR":
          "Admin gera presigned URL no Server Action e o browser faz PUT direto no S3. Sem expor credenciais.",
        en: "Admin generates a presigned URL in a Server Action and the browser PUTs directly to S3. No exposed credentials.",
      },
      order: 3,
    },
  ],
};
