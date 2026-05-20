import type { ProjectPayload } from "../project-upsert";

export const zerowork: ProjectPayload = {
  slug: "0work",
  title: "0work",
  shortDescription:
    "Personal CRM com gestão de clientes, propostas, faturas, geração de PDF e e-mail transacional — feito para freelancers.",
  category: "saas",
  status: "shipped",
  year: 2026,
  featured: false,
  order: 7,
  demoUrl: null,
  githubUrl: "https://github.com/devalexsantos/0work",
  techSlugs: [
    "nextjs",
    "typescript",
    "react",
    "tailwindcss",
    "shadcnui",
    "prisma",
    "postgresql",
    "zod",
    "resend",
    "docker",
  ],

  content: {
    "pt-BR": {
      fullDescription:
        "0work é um Personal CRM minimalista para freelancers e consultores: gestão de clientes, propostas, faturas com geração de PDF (`@react-pdf/renderer`), envio por e-mail via Resend, upload de assets para S3, autenticação Google via NextAuth, e templates customizáveis. Tudo em um único Next.js 15 com tema dark, sem dependência de plataformas pagas.",
      problem:
        "CRMs comerciais (Pipedrive, Hubspot) são pesados e caros para freelancer solo. Excel + e-mail manual quebra na primeira fatura mais complexa. Falta algo entre os dois: CRM pessoal, simples, mas com saída profissional (PDF de fatura, branding, e-mail transacional).",
      hypothesis:
        "Se eu juntar gestão de clientes + propostas + faturas + PDF + e-mail num app único, sem etapas extras, freelancers tornam o fluxo previsível e param de mandar fatura amassada no WhatsApp.",
      targetAudience:
        "Freelancers, consultores e devs solo que faturam 5–20 clientes/mês. Quer ferramenta pessoal sem custo recorrente e com saída profissional.",
      technicalDecisions:
        "Next.js 15 App Router como app único. Prisma 6 com adapter PG explícito (`@prisma/adapter-pg`) por experimento. `@react-pdf/renderer` para gerar PDFs server-side de fatura/proposta. NextAuth + Prisma adapter para Google OAuth + Credentials. Resend para e-mail transacional. AWS S3 com presigned URL para upload de logos e anexos. Base UI (`@base-ui/react`) e shadcn para UI.",
      learnings:
        "Gerar PDF server-side com `@react-pdf/renderer` deu controle total sobre o layout, mas exige cuidado com fontes (precisa registrar manualmente). Foi mais fácil que esperado integrar com Resend para anexar PDF e enviar — tudo no mesmo Server Action.",
      nextSteps:
        "Recorrência de faturas (mensal/trimestral/anual); integração com Stripe para receber pagamento direto pelo link da fatura; portal cliente onde ele baixa histórico; export para contabilidade.",
    },
    en: {
      fullDescription:
        "0work is a minimalist Personal CRM for freelancers and consultants: client management, proposals, invoices with PDF generation (`@react-pdf/renderer`), email sending via Resend, S3 asset upload, Google auth via NextAuth, and customizable templates. All in a single Next.js 15 with dark theme, no dependency on paid platforms.",
      problem:
        "Commercial CRMs (Pipedrive, Hubspot) are heavy and pricey for solo freelancers. Excel + manual email breaks on the first complex invoice. There's no middle ground: personal CRM, simple, but with a professional output (PDF invoice, branding, transactional email).",
      hypothesis:
        "Combine client management + proposals + invoices + PDF + email into a single app, no extra steps, and freelancers get a predictable flow and stop sending wrinkled invoices via WhatsApp.",
      targetAudience:
        "Freelancers, consultants, and solo devs invoicing 5–20 clients/month. Want a personal tool with no recurring cost and a professional output.",
      technicalDecisions:
        "Next.js 15 App Router as a single app. Prisma 6 with explicit PG adapter (`@prisma/adapter-pg`) as an experiment. `@react-pdf/renderer` to generate server-side invoice/proposal PDFs. NextAuth + Prisma adapter for Google OAuth + Credentials. Resend for transactional email. AWS S3 with presigned URL for logo/attachment uploads. Base UI (`@base-ui/react`) and shadcn for UI.",
      learnings:
        "Generating PDFs server-side with `@react-pdf/renderer` gave full layout control but requires careful font handling (manual registration). It was easier than expected to integrate with Resend to attach PDF and send — all inside the same Server Action.",
      nextSteps:
        "Recurring invoices (monthly/quarterly/yearly); Stripe integration to receive payment directly via the invoice link; client portal where they download history; accounting export.",
    },
  },

  architecture: {
    "pt-BR":
      "App Next.js 15 single-tier com App Router. Server Actions cuidam de toda mutação (criar cliente, gerar proposta, emitir fatura, enviar e-mail). `@react-pdf/renderer` produz o PDF dentro de uma Server Action e o stream resultante vai para 2 destinos em paralelo: download no browser e attachment em e-mail enviado via Resend. NextAuth com Prisma adapter cobre Google OAuth + Credentials. S3 entra só para uploads de logo/anexo via presigned URL. Deploy via Dockerfile multi-stage + docker-entrypoint.sh que aplica migrations.",
    en: "Single-tier Next.js 15 with App Router. Server Actions handle every mutation (create client, generate proposal, issue invoice, send email). `@react-pdf/renderer` produces the PDF inside a Server Action and the resulting stream goes to 2 destinations in parallel: browser download and attachment in an email sent via Resend. NextAuth with Prisma adapter covers Google OAuth + Credentials. S3 only used for logo/attachment uploads via presigned URL. Deploy via multi-stage Dockerfile + docker-entrypoint.sh that applies migrations.",
  },

  challenges: {
    "pt-BR":
      "1) **PDF server-side com tipografia customizada** — `@react-pdf/renderer` exige registro manual de fontes (`Font.register`) e cuidado com bundle. 2) **Numeração de fatura sequencial por cliente** sem race condition — uso transaction com `SELECT ... FOR UPDATE` para alocar o próximo número. 3) **Templates customizáveis** sem virar editor WYSIWYG complexo — JSON com campos opcionais (logo, cor primária, observações).",
    en: "1) **Server-side PDF with custom typography** — `@react-pdf/renderer` requires manual font registration (`Font.register`) and careful bundle handling. 2) **Per-client sequential invoice numbering** without race conditions — using a transaction with `SELECT ... FOR UPDATE` to allocate the next number. 3) **Customizable templates** without becoming a complex WYSIWYG — JSON with optional fields (logo, primary color, notes).",
  },

  readme: {
    "pt-BR": `# 0work — detalhamento técnico

0work é o "CRM pessoal" que eu queria pra mim. Substitui Pipedrive + Excel + Mailchimp por um app único Next.js que gera PDF, envia e-mail e mantém histórico. Sem dependência de SaaS pago.

## Topologia

\`\`\`mermaid
flowchart LR
  USER["Freelancer"] --> APP["Next.js 15<br/>App + Server Actions"]
  APP --> PG[("PostgreSQL<br/>+ Prisma")]
  APP -->|"render PDF<br/>(react-pdf)"| PDF["PDF stream"]
  PDF --> DOWNLOAD["Download<br/>no browser"]
  PDF --> EMAIL["Anexa + envia"]
  EMAIL --> RESEND["Resend"]
  RESEND --> CLIENT["E-mail do cliente"]
  APP -->|"presigned URL"| S3["AWS S3<br/>logos / anexos"]
  APP -->|"OAuth"| GOOGLE["Google"]
\`\`\`

## Fluxo da fatura

\`\`\`mermaid
sequenceDiagram
  participant U as Freelancer
  participant A as Server Action
  participant DB as Postgres
  participant PDF as react-pdf
  participant R as Resend
  participant C as Cliente

  U->>A: emite fatura (clientId, itens, vencimento)
  A->>DB: transaction
  Note over DB: SELECT next number FOR UPDATE
  DB-->>A: número
  A->>DB: insert Invoice
  A->>PDF: render(invoice + template)
  PDF-->>A: PDF Buffer
  A->>R: send(email + attachment)
  R->>C: e-mail com PDF anexo
  A-->>U: link/preview da fatura
\`\`\`

## Schema (parcial)

\`\`\`mermaid
erDiagram
  User ||--o{ Client : owns
  Client ||--o{ Proposal : has
  Client ||--o{ Invoice : has
  Invoice ||--o{ InvoiceItem : contains
  Proposal ||--o{ ProposalItem : contains

  Client {
    string id
    string name
    string email
    string cnpjCpf
    string defaultTemplate
  }
  Invoice {
    string id
    string clientId
    int number
    enum status
    decimal total
    datetime dueDate
  }
\`\`\`

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | Base UI + shadcn + Tailwind |
| Auth | NextAuth (Google + Credentials) + Prisma adapter |
| Banco | PostgreSQL + Prisma 6 (com PG adapter) |
| PDF | @react-pdf/renderer |
| E-mail | Resend |
| Storage | AWS S3 (presigned URL) |
| Formulários | React Hook Form + Zod |
| Deploy | Docker multi-stage + entrypoint com migrate |

## Decisões técnicas

- **PDF server-side**: \`react-pdf\` gera o PDF dentro da Server Action, sem viagem extra ao client. Permite anexar diretamente no e-mail.
- **\`@prisma/adapter-pg\` explícito**: experimentando o novo adapter Prisma 6 com \`pg\` driver direto.
- **Numeração com FOR UPDATE**: garante ordem sequencial mesmo com requests concorrentes.
- **Sem editor WYSIWYG**: templates são JSON com poucos campos (logo, cor, observações) — over-engineering puro tentar resolver edição visual.

## Roadmap

- Faturas recorrentes (mensal/trimestral/anual)
- Stripe Connect para pagamento via link na fatura
- Portal do cliente com histórico
- Export para contabilidade (CSV / SPED)`,
    en: `# 0work — technical deep dive

0work is the "personal CRM" I wanted for myself. Replaces Pipedrive + Excel + Mailchimp with a single Next.js app that generates PDFs, sends email and keeps history. No paid SaaS dependency.

## Topology

\`\`\`mermaid
flowchart LR
  USER["Freelancer"] --> APP["Next.js 15<br/>App + Server Actions"]
  APP --> PG[("PostgreSQL<br/>+ Prisma")]
  APP -->|"render PDF<br/>(react-pdf)"| PDF["PDF stream"]
  PDF --> DOWNLOAD["Browser<br/>download"]
  PDF --> EMAIL["Attach + send"]
  EMAIL --> RESEND["Resend"]
  RESEND --> CLIENT["Client inbox"]
  APP -->|"presigned URL"| S3["AWS S3<br/>logos / attachments"]
  APP -->|"OAuth"| GOOGLE["Google"]
\`\`\`

## Invoice flow

\`\`\`mermaid
sequenceDiagram
  participant U as Freelancer
  participant A as Server Action
  participant DB as Postgres
  participant PDF as react-pdf
  participant R as Resend
  participant C as Client

  U->>A: issue invoice (clientId, items, due)
  A->>DB: transaction
  Note over DB: SELECT next number FOR UPDATE
  DB-->>A: number
  A->>DB: insert Invoice
  A->>PDF: render(invoice + template)
  PDF-->>A: PDF Buffer
  A->>R: send(email + attachment)
  R->>C: email with PDF attached
  A-->>U: invoice link/preview
\`\`\`

## Schema (partial)

\`\`\`mermaid
erDiagram
  User ||--o{ Client : owns
  Client ||--o{ Proposal : has
  Client ||--o{ Invoice : has
  Invoice ||--o{ InvoiceItem : contains
  Proposal ||--o{ ProposalItem : contains

  Client {
    string id
    string name
    string email
    string cnpjCpf
    string defaultTemplate
  }
  Invoice {
    string id
    string clientId
    int number
    enum status
    decimal total
    datetime dueDate
  }
\`\`\`

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | Base UI + shadcn + Tailwind |
| Auth | NextAuth (Google + Credentials) + Prisma adapter |
| DB | PostgreSQL + Prisma 6 (with PG adapter) |
| PDF | @react-pdf/renderer |
| Email | Resend |
| Storage | AWS S3 (presigned URL) |
| Forms | React Hook Form + Zod |
| Deploy | Multi-stage Docker + entrypoint with migrate |

## Technical decisions

- **Server-side PDF**: \`react-pdf\` builds the PDF inside the Server Action, no extra client round-trip. Attaches directly to email.
- **Explicit \`@prisma/adapter-pg\`**: experimenting with the new Prisma 6 adapter using the \`pg\` driver directly.
- **FOR UPDATE numbering**: guarantees sequential order even with concurrent requests.
- **No WYSIWYG editor**: templates are JSON with a few fields (logo, color, notes) — overkill to try to solve visual editing.

## Roadmap

- Recurring invoices (monthly/quarterly/yearly)
- Stripe Connect for payment via invoice link
- Client portal with history
- Accounting export (CSV / SPED)`,
  },

  features: [
    {
      title: { "pt-BR": "Clientes + propostas + faturas", en: "Clients + proposals + invoices" },
      description: {
        "pt-BR": "CRUD completo. Cliente tem histórico de propostas, faturas pagas/em aberto, e tags próprias.",
        en: "Full CRUD. Each client has proposal history, paid/open invoices, and custom tags.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "Geração de PDF server-side", en: "Server-side PDF generation" },
      description: {
        "pt-BR": "`@react-pdf/renderer` produz fatura e proposta em PDF dentro da Server Action.",
        en: "`@react-pdf/renderer` produces invoice and proposal PDFs inside the Server Action.",
      },
      order: 2,
    },
    {
      title: { "pt-BR": "Envio por e-mail", en: "Email sending" },
      description: {
        "pt-BR": "Server Action anexa o PDF e dispara via Resend. Cliente recebe direto no inbox.",
        en: "Server Action attaches the PDF and fires via Resend. Client gets it straight in the inbox.",
      },
      order: 3,
    },
    {
      title: { "pt-BR": "Templates por cliente", en: "Per-client templates" },
      description: {
        "pt-BR": "JSON simples com logo, cor primária e observações. Sem editor visual — só os campos que importam.",
        en: "Simple JSON with logo, primary color and notes. No visual editor — just the fields that matter.",
      },
      order: 4,
    },
  ],

  decisions: [
    {
      title: { "pt-BR": "PDF gerado server-side", en: "Server-side PDF" },
      reason: { "pt-BR": "Permite anexar no e-mail sem round-trip extra", en: "Allows email attachment without extra round-trip" },
      description: {
        "pt-BR":
          "Render dentro da Server Action, stream vai pro download E pra mensagem do Resend. Um único fluxo.",
        en: "Render inside the Server Action, stream goes to download AND Resend message. Single flow.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "Numeração com FOR UPDATE", en: "Numbering with FOR UPDATE" },
      reason: { "pt-BR": "Evita race condition em emissões concorrentes", en: "Avoids race conditions in concurrent issuance" },
      description: {
        "pt-BR":
          "Transaction com lock pessimista no contador por cliente garante sequencial sem gap.",
        en: "Transaction with pessimistic lock on the per-client counter guarantees sequential numbering without gaps.",
      },
      order: 2,
    },
  ],
};
