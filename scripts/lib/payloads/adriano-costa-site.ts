import type { ProjectPayload } from "../project-upsert";

export const adrianoCostaSite: ProjectPayload = {
  slug: "adriano-costa-adv",
  title: "Adriano Costa Advocacia",
  shortDescription:
    "Site institucional de escritório jurídico em Next.js — Framer Motion, formulário com reCAPTCHA + EmailJS e SSG.",
  category: "frontend",
  status: "shipped",
  year: 2023,
  featured: false,
  order: 11,
  demoUrl: "https://adriano-costa-adv.vercel.app",
  githubUrl: "https://github.com/devalexsantos/adriano-costa-adv",
  techSlugs: [
    "nextjs",
    "typescript",
    "react",
    "tailwindcss",
    "framer-motion",
  ],

  content: {
    "pt-BR": {
      fullDescription:
        "Site institucional do escritório de advocacia Adriano Costa em Next.js, focado em apresentação de áreas de atuação, equipe e contato. Construído com Framer Motion para animações de entrada, Keen Slider para carrosséis de depoimentos, React Hook Form + reCAPTCHA + EmailJS para o formulário de contato sem precisar de backend próprio.",
      problem:
        "Pequeno escritório precisa de presença digital profissional sem custo de backend (servidor, e-mail, infraestrutura) e com formulário de contato que evite spam.",
      hypothesis:
        "Site estático com Next.js + formulário client-side disparando via EmailJS resolve o caso de uso completo, com Google reCAPTCHA bloqueando bots. Sem servidor próprio, sem custo de hospedagem.",
      targetAudience:
        "Advogado autônomo / escritório boutique em São Paulo. Cliente quer presença profissional e canal de contato com 0 custo recorrente.",
      technicalDecisions:
        "Next.js com `export` estático para hospedagem em qualquer CDN. Framer Motion para microinterações sutis (entrada de seções). Keen Slider para depoimentos. React Hook Form para validação client-side. reCAPTCHA v2 para anti-spam. EmailJS para enviar e-mail sem backend.",
      learnings:
        "Site simples como esse cabe em export estático e elimina custo de servidor. EmailJS é solução elegante para formulário sem backend, mas tem limite mensal de envios; vale para escritório pequeno.",
      nextSteps:
        "Migrar formulário para Next.js API Route + Resend ganha controle, mas só faz sentido se o tráfego ultrapassar o free tier do EmailJS.",
    },
    en: {
      fullDescription:
        "Institutional website for the Adriano Costa law firm in Next.js, focused on practice areas, team and contact. Built with Framer Motion for entry animations, Keen Slider for testimonial carousels, React Hook Form + reCAPTCHA + EmailJS for the contact form without needing a backend.",
      problem:
        "Small law firm needs professional digital presence without backend cost (server, email, infrastructure) and with a contact form that avoids spam.",
      hypothesis:
        "A Next.js static site + client-side form firing via EmailJS solves the full use case, with Google reCAPTCHA blocking bots. No own server, no hosting cost.",
      targetAudience:
        "Solo lawyer / boutique firm in São Paulo. Client wants professional presence and a contact channel at zero recurring cost.",
      technicalDecisions:
        "Next.js with static `export` for hosting on any CDN. Framer Motion for subtle micro-interactions (section entry). Keen Slider for testimonials. React Hook Form for client-side validation. reCAPTCHA v2 for anti-spam. EmailJS to send email without a backend.",
      learnings:
        "A simple site like this fits in static export and removes server cost. EmailJS is an elegant solution for backend-less forms, but has a monthly send cap; fine for small firms.",
      nextSteps:
        "Migrating the form to Next.js API Route + Resend gives more control, but only makes sense if traffic outgrows the EmailJS free tier.",
    },
  },

  architecture: {
    "pt-BR":
      "Next.js Pages Router (versão 13) com `next export` para deploy estático. Tudo é pré-renderizado: hero, áreas de atuação, sobre, equipe, depoimentos (Keen Slider), formulário de contato (RHF + reCAPTCHA + EmailJS) e footer. Tailwind para estilo. Framer Motion para animações de entrada em viewport. Nenhuma rota dinâmica, nenhum backend, deploy em Vercel.",
    en: "Next.js Pages Router (v13) with `next export` for static deploy. Everything is pre-rendered: hero, practice areas, about, team, testimonials (Keen Slider), contact form (RHF + reCAPTCHA + EmailJS), and footer. Tailwind for styling. Framer Motion for in-viewport entry animations. No dynamic routes, no backend, deployed on Vercel.",
  },

  challenges: {
    "pt-BR":
      "1) **Anti-spam sem backend** — Google reCAPTCHA v2 valida client-side e o token é enviado junto com o EmailJS para validação no servidor deles. 2) **Animações sutis sem prejudicar performance** — Framer Motion `whileInView` dispara só quando a seção entra no viewport. 3) **Carrossel de depoimentos** com Keen Slider configurado para acessibilidade (focus visible, navegação por teclado).",
    en: "1) **Backend-less anti-spam** — Google reCAPTCHA v2 validates client-side and the token is sent with EmailJS for validation on their end. 2) **Subtle animations without performance hit** — Framer Motion `whileInView` triggers only when the section enters the viewport. 3) **Testimonial carousel** with Keen Slider tuned for accessibility (focus visible, keyboard navigation).",
  },

  readme: {
    "pt-BR": `# Adriano Costa Advocacia — detalhamento técnico

Site institucional para escritório de advocacia. O ponto mais interessante não é o front em si — é a arquitetura "zero backend, zero custo recorrente" para um cliente que não pode (nem precisa) pagar hosting de servidor.

## Topologia

\`\`\`mermaid
flowchart LR
  USER["Visitante"] --> CDN["Vercel CDN<br/>(static export)"]
  CDN --> NEXT["Next.js<br/>páginas estáticas"]
  NEXT --> FORM["Formulário<br/>RHF + reCAPTCHA"]
  FORM -->|"submit + token"| EMAILJS["EmailJS"]
  EMAILJS -->|"verifica reCAPTCHA"| GOOGLE["Google reCAPTCHA"]
  EMAILJS -->|"SMTP relay"| INBOX["E-mail do escritório"]
\`\`\`

Nada de backend próprio, nada de Resend/SES nesta versão, nada de banco. Vercel hospeda o estático no plano gratuito.

## Fluxo de envio de contato

\`\`\`mermaid
sequenceDiagram
  participant U as Visitante
  participant F as Formulário
  participant CAP as reCAPTCHA v2
  participant E as EmailJS
  participant INBOX as Escritório

  U->>F: preenche nome + e-mail + mensagem
  U->>CAP: marca "não sou robô"
  CAP-->>F: token
  U->>F: clica "Enviar"
  F->>F: RHF valida
  F->>E: send(serviceId, templateId, payload + token)
  E->>CAP: verify(token)
  CAP-->>E: ok
  E->>INBOX: e-mail via SMTP
  E-->>F: sucesso
  F-->>U: toast "Mensagem enviada"
\`\`\`

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 13 (Pages Router) + \`next export\` |
| UI | React 18 + Tailwind |
| Animação | Framer Motion (\`whileInView\`) |
| Carrossel | Keen Slider |
| Formulário | React Hook Form |
| Anti-spam | Google reCAPTCHA v2 |
| Envio | EmailJS |
| Deploy | Vercel (estático) |

## Decisões técnicas

- **\`next export\` em vez de SSR**: o site não tem dados dinâmicos, então rodar Node em produção é desperdício.
- **EmailJS em vez de backend próprio**: 200 envios/mês grátis cobrem qualquer escritório pequeno; quando crescer, migra para Resend.
- **reCAPTCHA v2 em vez de v3**: o checkbox dá feedback explícito ao usuário e bloqueia bots básicos sem JS sofisticado.
- **Framer Motion \`whileInView\`**: animação só ao entrar no viewport reduz CPU em scroll longo.

## Limites

- Sem CMS — atualização de texto exige PR
- Sem analytics próprio (depende de GA no template)
- 200 envios/mês limitam crescimento; fácil migrar quando precisar`,
    en: `# Adriano Costa Advocacia — technical deep dive

Institutional website for a law firm. The most interesting bit isn't the front itself — it's the "zero backend, zero recurring cost" architecture for a client who can't (and doesn't need to) pay for server hosting.

## Topology

\`\`\`mermaid
flowchart LR
  USER["Visitor"] --> CDN["Vercel CDN<br/>(static export)"]
  CDN --> NEXT["Next.js<br/>static pages"]
  NEXT --> FORM["Form<br/>RHF + reCAPTCHA"]
  FORM -->|"submit + token"| EMAILJS["EmailJS"]
  EMAILJS -->|"verifies reCAPTCHA"| GOOGLE["Google reCAPTCHA"]
  EMAILJS -->|"SMTP relay"| INBOX["Firm inbox"]
\`\`\`

No own backend, no Resend/SES in this version, no database. Vercel hosts the static on the free plan.

## Contact submission flow

\`\`\`mermaid
sequenceDiagram
  participant U as Visitor
  participant F as Form
  participant CAP as reCAPTCHA v2
  participant E as EmailJS
  participant INBOX as Firm

  U->>F: fills name + email + message
  U->>CAP: ticks "I'm not a robot"
  CAP-->>F: token
  U->>F: clicks "Send"
  F->>F: RHF validates
  F->>E: send(serviceId, templateId, payload + token)
  E->>CAP: verify(token)
  CAP-->>E: ok
  E->>INBOX: email via SMTP
  E-->>F: success
  F-->>U: toast "Message sent"
\`\`\`

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 13 (Pages Router) + \`next export\` |
| UI | React 18 + Tailwind |
| Animation | Framer Motion (\`whileInView\`) |
| Carousel | Keen Slider |
| Form | React Hook Form |
| Anti-spam | Google reCAPTCHA v2 |
| Send | EmailJS |
| Deploy | Vercel (static) |

## Technical decisions

- **\`next export\` over SSR**: site has no dynamic data, so running Node in production would be waste.
- **EmailJS over own backend**: 200 sends/month free covers any small firm; migrate to Resend when it grows.
- **reCAPTCHA v2 over v3**: checkbox gives explicit user feedback and blocks basic bots without sophisticated JS.
- **Framer Motion \`whileInView\`**: animation only on viewport entry reduces CPU on long scrolls.

## Limits

- No CMS — text updates require a PR
- No first-party analytics (relies on GA in the template)
- 200 sends/month caps growth; easy migration when needed`,
  },

  features: [
    {
      title: { "pt-BR": "Site estático full", en: "Fully static site" },
      description: {
        "pt-BR": "`next export` para deploy em CDN sem rodar Node em produção. Custo zero recorrente.",
        en: "`next export` for CDN deploy without running Node in production. Zero recurring cost.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "Formulário sem backend", en: "Backend-less form" },
      description: {
        "pt-BR": "React Hook Form + reCAPTCHA + EmailJS dispara e-mail sem precisar de servidor próprio.",
        en: "React Hook Form + reCAPTCHA + EmailJS sends mail without needing own server.",
      },
      order: 2,
    },
    {
      title: { "pt-BR": "Animações em viewport", en: "Viewport animations" },
      description: {
        "pt-BR": "Framer Motion `whileInView` para microanimações sutis em cada seção.",
        en: "Framer Motion `whileInView` for subtle micro-animations per section.",
      },
      order: 3,
    },
  ],

  decisions: [
    {
      title: { "pt-BR": "Zero backend", en: "Zero backend" },
      reason: { "pt-BR": "Cliente sem orçamento de infra recorrente", en: "Client with no recurring infra budget" },
      description: {
        "pt-BR":
          "Estático + EmailJS + reCAPTCHA cobre todas as necessidades. Migração para Resend quando o tráfego pedir.",
        en: "Static + EmailJS + reCAPTCHA covers every need. Migration to Resend when traffic demands.",
      },
      order: 1,
    },
  ],
};
