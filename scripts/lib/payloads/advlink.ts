import type { ProjectPayload } from "../project-upsert";

export const advlink: ProjectPayload = {
  slug: "advlink",
  title: "AdvLink",
  shortDescription:
    "SaaS para advogados criarem perfis profissionais com subdomínio próprio, assinatura, painel admin e analytics.",
  category: "saas",
  status: "shipped",
  year: 2025,
  featured: true,
  order: 1,
  demoUrl: "https://advlink.site",
  githubUrl: "https://github.com/devalexsantos/advlink",
  techSlugs: [
    "nextjs",
    "typescript",
    "react",
    "tailwindcss",
    "shadcnui",
    "prisma",
    "postgresql",
    "nodejs",
    "stripe",
    "resend",
    "docker",
    "easypanel",
  ],

  content: {
    "pt-BR": {
      fullDescription:
        "AdvLink é uma plataforma SaaS pensada para que advogados brasileiros publiquem um site profissional em minutos, com subdomínio próprio (`*.advlink.site`), editor visual com preview ao vivo, áreas de atuação, galeria, links externos, analytics e suporte por tickets. O produto é construído em monorepo (Next.js 15 app + landing estática em Nginx + blog em MDX), tem painel administrativo interno separado por JWT, billing via Stripe e onboarding em múltiplas etapas.",
      problem:
        "Advogados precisam de presença digital profissional, mas a maioria não tem tempo, conhecimento técnico ou orçamento para contratar um desenvolvedor. Templates genéricos não respeitam o regramento da OAB para publicidade e ainda exigem hospedagem, domínio e manutenção. O fluxo manual de 'WordPress + tema + plugin de SEO' é caro, frágil e raramente escala.",
      hypothesis:
        "Se entregarmos um editor visual focado no nicho jurídico, com preview em tempo real, subdomínio incluso, restrições visuais que respeitam a OAB e billing recorrente integrado, advogados aceitam pagar uma mensalidade simples em vez de gastar horas configurando ferramentas genéricas.",
      targetAudience:
        "Advogados autônomos e pequenos escritórios brasileiros (1–5 sócios), com foco em áreas de alto volume (previdenciário, trabalhista, consumidor) que se beneficiam de captação digital.",
      technicalDecisions:
        "Next.js 15 com App Router e Server Components por padrão; middleware que faz roteamento por subdomínio (`*.advlink.site` → `/adv/[slug]`) e protege rotas autenticadas; NextAuth para clientes finais e JWT (jose) independente para admin interno; Prisma + PostgreSQL como source-of-truth; Stripe para billing; Resend para e-mails transacionais; deploy via Docker standalone no EasyPanel.",
      learnings:
        "Construir o produto como monorepo (web + landing + blog) facilitou iterar em copy de marketing e SEO sem rebuildar o app. A separação de autenticação (NextAuth para usuários e JWT próprio para admin) evitou acoplar permissões críticas ao fluxo público. O preview ao vivo no editor virou diferencial de venda — usuários veem o site final enquanto editam.",
      nextSteps:
        "Multi-tenant com domínios customizados via Cloudflare for SaaS; templates de áreas de atuação prontas; integração com WhatsApp Business para captação direta dos cards; relatórios mensais por e-mail com métricas de visitação.",
    },
    en: {
      fullDescription:
        "AdvLink is a SaaS platform that lets Brazilian lawyers publish a professional website in minutes, with their own subdomain (`*.advlink.site`), a live-preview visual editor, practice areas, gallery, external links, analytics, and ticket-based support. It is built as a monorepo (Next.js 15 app + static Nginx landing + MDX blog), has a separate JWT-protected admin panel, Stripe billing, and a multi-step onboarding flow.",
      problem:
        "Lawyers need professional digital presence but most lack the time, technical know-how, or budget to hire a developer. Generic templates ignore Brazilian Bar (OAB) advertising rules and still require hosting, domain, and ongoing maintenance. The 'WordPress + theme + SEO plugin' route is expensive, fragile, and rarely scales.",
      hypothesis:
        "Deliver a visual editor tuned for the legal niche — live preview, included subdomain, visual rules that respect OAB constraints, and integrated recurring billing — and lawyers will pay a simple monthly fee instead of wrestling with generic tools.",
      targetAudience:
        "Solo lawyers and small Brazilian law firms (1–5 partners), especially in high-volume practice areas (social-security, labor, consumer) that benefit from digital lead generation.",
      technicalDecisions:
        "Next.js 15 with App Router and Server Components by default; middleware handles subdomain routing (`*.advlink.site` → `/adv/[slug]`) and gates authenticated routes; NextAuth for end users and a separate `jose` JWT for the internal admin; Prisma + PostgreSQL as the source of truth; Stripe for billing; Resend for transactional email; deployed as a standalone Docker image on EasyPanel.",
      learnings:
        "Shaping the product as a monorepo (web + landing + blog) made it possible to iterate on marketing copy and SEO without rebuilding the app. Splitting auth (NextAuth for users, custom JWT for admin) kept critical permissions away from the public flow. Live preview inside the editor became a real sales differentiator — users see the final site as they edit.",
      nextSteps:
        "Multi-tenant with custom domains via Cloudflare for SaaS; ready-made templates per practice area; WhatsApp Business integration to receive leads directly from the cards; monthly analytics email reports.",
    },
  },

  architecture: {
    "pt-BR":
      "Monorepo com três frentes independentes: `web/` (Next.js 15 App Router) é o app principal com dashboard, editor, perfil público e admin interno; `lp/` é a landing page estática em Nginx (HTML/SCSS otimizado para conversão); `blog/` é um Next.js separado com conteúdo MDX para SEO. Postgres é compartilhado via `docker-compose.yml`. O middleware do app principal faz dispatch por subdomínio: requisições para `slug.advlink.site` são reescritas internamente para `/adv/[slug]`, permitindo URLs limpas sem que o usuário final perceba a infraestrutura. Autenticação é dual: NextAuth (magic link + Google OAuth) para clientes, e um JWT próprio com `jose` para o painel admin (`ADMIN_JWT_SECRET`).",
    en: "Monorepo with three independent fronts: `web/` (Next.js 15 App Router) is the main app with dashboard, editor, public profile, and internal admin; `lp/` is a static Nginx landing page (HTML/SCSS tuned for conversion); `blog/` is a separate Next.js with MDX content for SEO. Postgres is shared via `docker-compose.yml`. The main app's middleware dispatches by subdomain: requests to `slug.advlink.site` are internally rewritten to `/adv/[slug]`, giving clean URLs without exposing the underlying routing. Auth is dual: NextAuth (magic link + Google OAuth) for customers, plus a separate `jose` JWT for the admin panel (`ADMIN_JWT_SECRET`).",
  },

  challenges: {
    "pt-BR":
      "1) **Roteamento por subdomínio em runtime**: o middleware precisa identificar o tenant pelo Host header e reescrever para o segmento dinâmico sem perder cache de páginas estáticas. 2) **Editor com preview ao vivo**: render imediato do site enquanto o usuário digita exigiu separar estado em `EditFormContext` e usar mutações otimistas. 3) **Compliance OAB**: certas combinações de texto/imagem são proibidas (preços, garantias); o editor bloqueia visualmente esses padrões em vez de só validar no submit. 4) **Coexistência de dois fluxos de auth** sem vazar permissões de admin para usuários finais.",
    en: "1) **Runtime subdomain routing**: the middleware has to identify the tenant by Host header and rewrite to the dynamic segment without breaking static page caching. 2) **Live-preview editor**: rendering the public site as the user types required isolating state in `EditFormContext` and using optimistic mutations. 3) **OAB compliance**: certain text/image combinations are banned (prices, guarantees); the editor blocks those patterns visually instead of only validating at submit. 4) **Two auth flows side-by-side** without leaking admin permissions into the public surface.",
  },

  readme: {
    "pt-BR": `# AdvLink — detalhamento técnico

AdvLink é o maior projeto em escala desse portfólio: um SaaS multi-tenant com editor visual, billing recorrente, painel admin interno e onboarding em múltiplas etapas. Esta seção mostra como ele é organizado por baixo do capô.

## Visão arquitetural

\`\`\`mermaid
flowchart LR
  subgraph CDN["Cloudflare DNS"]
    direction TB
    DNS["*.advlink.site"]
  end

  subgraph App["Next.js 15 (web/)"]
    MID["middleware.ts<br/>(subdomain rewrite)"]
    APP_ROUTER["App Router<br/>RSC + Server Actions"]
    ADMIN["/admin/*<br/>JWT (jose)"]
    NEXTAUTH["NextAuth<br/>(magic link, Google)"]
  end

  subgraph LP["Nginx (lp/)"]
    LANDING["Landing estática<br/>HTML + SCSS"]
  end

  subgraph BLOG["Next.js (blog/)"]
    MDX["Conteúdo MDX"]
  end

  subgraph Data["Infra"]
    PG[("PostgreSQL<br/>compartilhado")]
    STRIPE["Stripe<br/>Subscriptions"]
    RESEND["Resend<br/>e-mail transacional"]
  end

  DNS --> MID
  DNS --> LANDING
  DNS --> MDX
  MID -->|"slug.advlink.site"| APP_ROUTER
  APP_ROUTER --> PG
  APP_ROUTER --> STRIPE
  APP_ROUTER --> RESEND
  ADMIN --> PG
  NEXTAUTH --> PG
\`\`\`

## Fluxo de cadastro e publicação

\`\`\`mermaid
sequenceDiagram
  participant U as Usuário
  participant LP as Landing (lp/)
  participant App as Web (Next.js)
  participant Auth as NextAuth
  participant DB as Postgres
  participant Stripe as Stripe

  U->>LP: visita advlink.site
  LP-->>U: copy + CTA "Criar perfil"
  U->>App: /login
  App->>Auth: magic link / Google
  Auth-->>U: e-mail de verificação
  U->>App: /onboarding/profile (multi-step)
  App->>DB: cria Profile rascunho
  App->>Stripe: cria Customer + Subscription (trial)
  App->>DB: marca published=true
  Note over App: subdomínio "slug.advlink.site" agora resolve
\`\`\`

## Estrutura do monorepo

\`\`\`
advlink/
├── web/                    # App principal (Next.js 15)
│   ├── app/
│   │   ├── (auth)/         # login + recuperação
│   │   ├── onboarding/     # fluxo multi-step
│   │   ├── profile/        # dashboard + editor + analytics
│   │   ├── adv/[slug]/     # perfil público (resolvido via subdomínio)
│   │   └── admin/          # painel interno (JWT separado)
│   ├── lib/admin-auth.ts   # jose JWT helper
│   ├── middleware.ts       # subdomain rewrite + auth gate
│   └── prisma/             # schema multi-tenant
├── lp/                     # landing estática (Nginx)
├── blog/                   # Next.js MDX
└── docker-compose.yml      # Postgres compartilhado
\`\`\`

## Decisões técnicas relevantes

| Decisão | Por quê |
|---|---|
| **Subdomain rewrite no middleware** | Mantém URLs limpas (\`escritorio.advlink.site\`) sem precisar de Cloudflare for SaaS no MVP. |
| **Dois fluxos de auth** | NextAuth para clientes (UX previsível, magic link + OAuth) e JWT próprio para admin (controle total das claims e auditoria). |
| **Editor com preview** | \`EditFormContext\` carrega o site público no iframe lateral e re-renderiza por mutação otimista; mudanças aparecem em <300ms. |
| **App Router por padrão** | Server Components reduzem o JS enviado no editor, que tem muitos componentes pesados (DnD, crop, markdown). |
| **Standalone Docker no EasyPanel** | Mesmo padrão dos meus outros SaaS — \`output: standalone\`, runner mínimo, migrations no entrypoint. |

## Painel administrativo

Separado em \`/admin/*\` com layout próprio (Shadcn sidebar), autenticação por cookie JWT (\`admin-token\`) assinado com \`jose\`, e middleware que bloqueia acesso fora do allowlist de e-mails. Permite gerenciar usuários, sites publicados, tickets de suporte, eventos de analytics, financeiro (consulta direta no Stripe) e log de auditoria.

## Fora de escopo (por enquanto)

- Multi-tenant com domínio customizado (planejado via Cloudflare for SaaS)
- App nativo / publicações mobile
- Editor de seções customizadas com drag-and-drop livre`,
    en: `# AdvLink — technical deep dive

AdvLink is the largest project in this portfolio by scope: a multi-tenant SaaS with visual editor, recurring billing, an internal admin panel, and a multi-step onboarding flow. This section shows how it is organized under the hood.

## Architecture overview

\`\`\`mermaid
flowchart LR
  subgraph CDN["Cloudflare DNS"]
    direction TB
    DNS["*.advlink.site"]
  end

  subgraph App["Next.js 15 (web/)"]
    MID["middleware.ts<br/>(subdomain rewrite)"]
    APP_ROUTER["App Router<br/>RSC + Server Actions"]
    ADMIN["/admin/*<br/>JWT (jose)"]
    NEXTAUTH["NextAuth<br/>(magic link, Google)"]
  end

  subgraph LP["Nginx (lp/)"]
    LANDING["Static landing<br/>HTML + SCSS"]
  end

  subgraph BLOG["Next.js (blog/)"]
    MDX["MDX content"]
  end

  subgraph Data["Infra"]
    PG[("PostgreSQL<br/>shared")]
    STRIPE["Stripe<br/>Subscriptions"]
    RESEND["Resend<br/>transactional email"]
  end

  DNS --> MID
  DNS --> LANDING
  DNS --> MDX
  MID -->|"slug.advlink.site"| APP_ROUTER
  APP_ROUTER --> PG
  APP_ROUTER --> STRIPE
  APP_ROUTER --> RESEND
  ADMIN --> PG
  NEXTAUTH --> PG
\`\`\`

## Sign-up and publish flow

\`\`\`mermaid
sequenceDiagram
  participant U as User
  participant LP as Landing (lp/)
  participant App as Web (Next.js)
  participant Auth as NextAuth
  participant DB as Postgres
  participant Stripe as Stripe

  U->>LP: visits advlink.site
  LP-->>U: copy + "Create profile" CTA
  U->>App: /login
  App->>Auth: magic link / Google
  Auth-->>U: verification email
  U->>App: /onboarding/profile (multi-step)
  App->>DB: creates draft Profile
  App->>Stripe: creates Customer + Subscription (trial)
  App->>DB: marks published=true
  Note over App: subdomain "slug.advlink.site" now resolves
\`\`\`

## Monorepo layout

\`\`\`
advlink/
├── web/                    # main app (Next.js 15)
│   ├── app/
│   │   ├── (auth)/         # login + recovery
│   │   ├── onboarding/     # multi-step flow
│   │   ├── profile/        # dashboard + editor + analytics
│   │   ├── adv/[slug]/     # public profile (served via subdomain)
│   │   └── admin/          # internal panel (separate JWT)
│   ├── lib/admin-auth.ts   # jose JWT helper
│   ├── middleware.ts       # subdomain rewrite + auth gate
│   └── prisma/             # multi-tenant schema
├── lp/                     # static Nginx landing
├── blog/                   # Next.js MDX
└── docker-compose.yml      # shared Postgres
\`\`\`

## Key technical decisions

| Decision | Why |
|---|---|
| **Subdomain rewrite in middleware** | Keeps URLs clean (\`firm.advlink.site\`) without needing Cloudflare for SaaS in the MVP. |
| **Two auth flows** | NextAuth for customers (predictable UX, magic link + OAuth) and a custom JWT for admin (full control over claims and audit). |
| **Live-preview editor** | \`EditFormContext\` loads the public site in a side iframe and re-renders via optimistic mutations; changes appear in under 300ms. |
| **App Router by default** | Server Components cut the JS shipped to the editor, which has heavy components (DnD, image crop, markdown). |
| **Standalone Docker on EasyPanel** | Same pattern as my other SaaS — \`output: standalone\`, minimal runner, migrations in entrypoint. |

## Admin panel

Lives under \`/admin/*\` with its own Shadcn-sidebar layout, JWT cookie auth (\`admin-token\`) signed with \`jose\`, and middleware that gates access by email allowlist. Lets staff manage users, published sites, support tickets, analytics events, financial views (queried directly against Stripe) and an audit log.

## Out of scope (for now)

- Multi-tenant with custom domains (planned via Cloudflare for SaaS)
- Native mobile app / mobile publishing
- Free-form drag-and-drop editor of custom sections`,
  },

  features: [
    {
      title: { "pt-BR": "Editor com preview ao vivo", en: "Live-preview editor" },
      description: {
        "pt-BR":
          "Sidebar com 9 abas (estilo, perfil, endereço, áreas, galeria, links, seções extras, reordenar, SEO). Cada mudança reflete imediatamente no iframe lateral.",
        en: "Sidebar with 9 tabs (style, profile, address, practice areas, gallery, links, extra sections, reorder, SEO). Every change is reflected immediately in the side iframe.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "Subdomínio por cliente", en: "Per-customer subdomain" },
      description: {
        "pt-BR":
          "Cada perfil publicado fica em `<slug>.advlink.site` via rewrite no middleware. Sem configuração de DNS por parte do usuário.",
        en: "Every published profile lives at `<slug>.advlink.site` via middleware rewrite. No DNS configuration required from the user.",
      },
      order: 2,
    },
    {
      title: { "pt-BR": "Billing recorrente com Stripe", en: "Stripe recurring billing" },
      description: {
        "pt-BR":
          "Trial, upgrade, downgrade e cancelamento self-service. Webhooks atualizam o estado da assinatura no Postgres.",
        en: "Trial, upgrade, downgrade and self-service cancellation. Webhooks sync subscription state into Postgres.",
      },
      order: 3,
    },
    {
      title: { "pt-BR": "Painel admin com JWT", en: "Admin panel with JWT" },
      description: {
        "pt-BR":
          "Dashboard interno separado em `/admin/*`, com sessão própria via `jose`, allowlist de e-mails e log de auditoria.",
        en: "Internal dashboard under `/admin/*`, with its own `jose`-based session, email allowlist, and audit log.",
      },
      order: 4,
    },
    {
      title: { "pt-BR": "Tickets de suporte", en: "Support tickets" },
      description: {
        "pt-BR":
          "Sistema de tickets com lista, detalhe e troca de mensagens entre cliente e admin, com notificações por e-mail via Resend.",
        en: "Ticket system with list, detail and message exchange between customer and admin, with email notifications via Resend.",
      },
      order: 5,
    },
    {
      title: { "pt-BR": "Analytics próprio", en: "First-party analytics" },
      description: {
        "pt-BR":
          "Eventos de pageview e cliques nos cards são gravados no Postgres e exibidos em `/profile/analytics`.",
        en: "Pageview and card-click events are stored in Postgres and surfaced in `/profile/analytics`.",
      },
      order: 6,
    },
  ],

  decisions: [
    {
      title: {
        "pt-BR": "Roteamento por subdomínio no middleware",
        en: "Subdomain routing in middleware",
      },
      reason: {
        "pt-BR": "Evita custo + complexidade do Cloudflare for SaaS no MVP",
        en: "Avoids the cost and complexity of Cloudflare for SaaS in the MVP",
      },
      description: {
        "pt-BR":
          "O `middleware.ts` lê o Host header, identifica o slug e faz `rewrite` interno para `/adv/[slug]`. URLs continuam limpas e o cache estático funciona normalmente.",
        en: "`middleware.ts` reads the Host header, identifies the slug and internally `rewrite`s to `/adv/[slug]`. URLs stay clean and static caching keeps working.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "Dois sistemas de auth", en: "Two auth systems" },
      reason: {
        "pt-BR":
          "Permissões críticas do admin não podem reusar a sessão pública",
        en: "Critical admin permissions can't share the public session",
      },
      description: {
        "pt-BR":
          "Clientes finais autenticam com NextAuth (magic link + Google). O admin usa um JWT próprio com `jose`, cookie HttpOnly e claim de role com allowlist.",
        en: "End customers sign in with NextAuth (magic link + Google). Admin uses a custom `jose` JWT, HttpOnly cookie and a role claim plus email allowlist.",
      },
      order: 2,
    },
    {
      title: { "pt-BR": "Monorepo com 3 deploys", en: "Monorepo with 3 deploys" },
      reason: {
        "pt-BR":
          "Permite iterar em landing/blog sem rebuildar o app principal",
        en: "Lets us iterate on landing/blog without rebuilding the main app",
      },
      description: {
        "pt-BR":
          "`web/` (app), `lp/` (landing estática Nginx) e `blog/` (Next MDX) compartilham só o Postgres. Cada um tem ciclo de deploy próprio no EasyPanel.",
        en: "`web/` (app), `lp/` (static Nginx landing) and `blog/` (Next MDX) share only Postgres. Each has its own deploy cycle on EasyPanel.",
      },
      order: 3,
    },
  ],
};
