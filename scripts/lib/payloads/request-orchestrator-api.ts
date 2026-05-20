import type { ProjectPayload } from "../project-upsert";

export const requestOrchestratorApi: ProjectPayload = {
  slug: "request-orchestrator-api",
  title: "Request Orchestrator API",
  shortDescription:
    "API GraphQL para enfileirar e orquestrar requisições HTTP com BullMQ — filas nomeadas, retries e rastreamento de tasks.",
  category: "fullstack",
  status: "shipped",
  year: 2024,
  featured: false,
  order: 8,
  demoUrl: null,
  githubUrl: "https://github.com/devalexsantos/request-orchestrator-api",
  techSlugs: [
    "nodejs",
    "typescript",
    "prisma",
    "postgresql",
    "redis",
    "docker",
  ],

  content: {
    "pt-BR": {
      fullDescription:
        "Request Orchestrator API é um backend GraphQL feito para receber tasks de processamento HTTP, distribuí-las em filas BullMQ nomeadas, executá-las com retry/backoff configurável, e expor estado via mutations e queries para um cliente externo. Roda sobre Express + Apollo Server, persiste fila + tasks em PostgreSQL via Prisma e usa Redis como broker.",
      problem:
        "Várias empresas com integrações externas batem em APIs lentas ou instáveis e precisam de uma camada que: a) absorva picos sem perder request; b) faça retry com backoff; c) deixe rastreável o status de cada task. Implementar isso ad-hoc dentro do produto principal vira dívida técnica e quebra em produção.",
      hypothesis:
        "Se houver uma API genérica que recebe 'execute essa request HTTP em essa fila' via GraphQL e devolve status assíncrono, qualquer produto pode delegar a coordenação para ela — sem reescrever lógica de retry, backoff e observabilidade em cada serviço.",
      targetAudience:
        "Times de engenharia que precisam orquestrar integrações com APIs externas instáveis (gateways de pagamento, serviços fiscais, notificações em massa) e querem desacoplar fila do produto principal.",
      technicalDecisions:
        "GraphQL via Apollo Server (Express middleware) para flexibilidade de queries do cliente. Prisma + Postgres como source-of-truth do estado das tasks (idempotência e auditoria). BullMQ + Redis para a fila propriamente dita. JWT no middleware para autenticação. Worker roda no mesmo container do API para simplificar deploy em homelab.",
      learnings:
        "Manter o estado da task duplicado em Postgres (fonte da verdade) + Redis (operações de fila) exige cuidado com consistência: quando o job termina, o worker grava no Postgres antes de ack na fila. Implementei o `taskProcessor` com idempotência por taskId para sobreviver a duplicações.",
      nextSteps:
        "UI dedicada (existe `request-orchestrator-ui` em paralelo); webhooks de notificação quando uma task muda de estado; isolamento de filas por organização (multi-tenant); dashboard de métricas Prometheus.",
    },
    en: {
      fullDescription:
        "Request Orchestrator API is a GraphQL backend designed to receive HTTP-processing tasks, dispatch them across named BullMQ queues, run them with configurable retry/backoff, and expose state via queries and mutations to an external client. Built on Express + Apollo Server, persists queues + tasks in PostgreSQL via Prisma, and uses Redis as the broker.",
      problem:
        "Many companies with external integrations hit slow or flaky APIs and need a layer that: a) absorbs spikes without dropping requests; b) retries with backoff; c) keeps each task's status traceable. Implementing this ad-hoc inside the main product becomes tech debt and breaks in production.",
      hypothesis:
        "If there's a generic API that takes 'run this HTTP request on that queue' via GraphQL and returns async status, any product can delegate coordination to it — without rewriting retry, backoff, and observability per service.",
      targetAudience:
        "Engineering teams that orchestrate integrations with flaky external APIs (payment gateways, fiscal services, bulk notifications) and want the queue decoupled from the main product.",
      technicalDecisions:
        "GraphQL via Apollo Server (Express middleware) for client query flexibility. Prisma + Postgres as the task-state source of truth (idempotency and audit). BullMQ + Redis for the queue itself. JWT in the middleware for authentication. Worker runs in the same container as the API to keep homelab deploy simple.",
      learnings:
        "Keeping task state mirrored in Postgres (source of truth) + Redis (queue operations) requires care: when the job finishes, the worker writes to Postgres before acking the queue. I implemented `taskProcessor` with per-taskId idempotency to survive duplicates.",
      nextSteps:
        "Dedicated UI (already exists as `request-orchestrator-ui`); webhook notifications on task state changes; per-organization queue isolation (multi-tenant); Prometheus metrics dashboard.",
    },
  },

  architecture: {
    "pt-BR":
      "Stack enxuta: um único container Node.js roda o Express + Apollo Server (entrada GraphQL) e o worker BullMQ (consumidor da fila). Postgres armazena `Queue` (filas nomeadas) e `Task` (cada execução com payload + status + attempts). Redis cumpre o papel duplo de broker BullMQ. Autenticação no `authMiddleware.ts` valida JWT antes de qualquer resolver. `taskProcessor.ts` é a função que efetivamente executa cada job — desacoplada dos resolvers para fácil teste.",
    en: "Tight stack: a single Node.js container runs Express + Apollo Server (GraphQL entry) and the BullMQ worker (queue consumer). Postgres stores `Queue` (named queues) and `Task` (each execution with payload + status + attempts). Redis plays the dual role of BullMQ broker. Auth in `authMiddleware.ts` validates JWT before any resolver. `taskProcessor.ts` is the function that actually runs each job — decoupled from resolvers for easy testing.",
  },

  challenges: {
    "pt-BR":
      "1) **Consistência entre Postgres e Redis** — task pode ser marcada como `Completed` no banco mas falhar o ack na fila; o worker resolve com idempotência por taskId. 2) **Retry com backoff** sem mascarar erros permanentes — `maxRetries` por task + classificação de erro (4xx não retenta). 3) **Schema GraphQL** que aceita payload arbitrário (`graphql-type-json`) sem perder tipagem nos resolvers.",
    en: "1) **Consistency between Postgres and Redis** — a task can be marked `Completed` in the DB but fail to ack the queue; the worker handles this with per-taskId idempotency. 2) **Retry with backoff** without hiding permanent failures — `maxRetries` per task + error classification (4xx skips retry). 3) **GraphQL schema** that accepts arbitrary payloads (`graphql-type-json`) without losing resolver typing.",
  },

  readme: {
    "pt-BR": `# Request Orchestrator API — detalhamento técnico

Projeto de portfólio com escopo cirúrgico: oferecer uma API GraphQL que recebe tasks de processamento HTTP, joga numa fila nomeada e devolve status. Resolve um problema comum em integrações: encapsular o retry/backoff fora do produto principal.

## Topologia

\`\`\`mermaid
flowchart LR
  CLIENT["Cliente externo<br/>(SaaS, app, CLI)"]
  subgraph Container["Container Node.js"]
    API["Express + Apollo<br/>GraphQL"]
    WORKER["Worker BullMQ"]
  end
  PG[("PostgreSQL<br/>Queue, Task")]
  R[("Redis<br/>BullMQ broker")]
  EXT["API externa<br/>(target)"]

  CLIENT -- JWT --> API
  API --> PG
  API -->|"enqueue"| R
  R --> WORKER
  WORKER --> PG
  WORKER -->|"HTTP"| EXT
\`\`\`

## Schema de dados

\`\`\`mermaid
erDiagram
  Queue ||--o{ Task : contains

  Queue {
    string id
    string name
    string description
    datetime createdAt
  }
  Task {
    string id
    string queueName
    string status
    int attempts
    int maxRetries
    string payload
    string queueId
    datetime createdAt
    datetime updatedAt
  }
\`\`\`

- \`Queue\` é a fila nomeada (configuração + descrição)
- \`Task\` é cada execução, com \`status\` (\`Pendente | Processando | Concluida | Falhou\`), \`attempts\`, \`maxRetries\` e \`payload\` (JSON arbitrário com URL, método, headers, body)

## Fluxo de uma task

\`\`\`mermaid
sequenceDiagram
  participant C as Cliente
  participant API as Apollo Server
  participant DB as Postgres
  participant Q as Redis (BullMQ)
  participant W as Worker
  participant EXT as API externa

  C->>API: mutation enqueueTask(queue, payload)
  API->>DB: insert Task(status=Pendente)
  API->>Q: add job(taskId)
  API-->>C: Task { id, status: "Pendente" }

  Q->>W: job(taskId)
  W->>DB: load Task; update status=Processando
  W->>EXT: HTTP request
  alt sucesso
    EXT-->>W: 2xx
    W->>DB: status=Concluida
  else falha
    EXT-->>W: 5xx / timeout
    W->>DB: attempts++
    alt attempts < maxRetries
      W->>Q: re-enqueue (backoff exponencial)
    else
      W->>DB: status=Falhou
    end
  end
\`\`\`

## Estrutura do código

\`\`\`
src/
├── api/graphql.ts          # type defs + resolvers (Apollo)
├── queues/
│   ├── queueManager.ts     # criação/lookup de filas
│   └── taskProcessor.ts    # função executora do job
├── lib/prisma.ts           # cliente Prisma singleton
└── utils/
    ├── authMiddleware.ts   # JWT (Express middleware)
    └── validator.ts        # payload validation
\`\`\`

## Decisões técnicas

- **GraphQL e não REST**: cliente pode pedir só os campos que precisa da \`Task\` (\`id, status, attempts\`) sem rotas separadas.
- **Mesmo container para API + worker**: simplifica deploy em VPS pequena. Em produção, escalar = container separado para worker.
- **Idempotência por taskId**: o worker checa o status atual antes de processar; sobrevive a duplicações da fila.
- **GraphQL JSON scalar**: o payload é arbitrário (URL, método, body), então \`graphql-type-json\` evita esquema rígido. Validação fica no \`utils/validator.ts\`.

## Limitações conhecidas

- Sem multi-tenancy (uma instância = uma organização)
- Sem dashboard (existe a UI separada em \`request-orchestrator-ui\`)
- Sem dead-letter queue (tasks falhadas ficam só no Postgres)`,
    en: `# Request Orchestrator API — technical deep dive

Portfolio project with a surgical scope: offer a GraphQL API that takes HTTP-processing tasks, puts them on a named queue and returns status. Solves a common integration problem: encapsulating retry/backoff outside the main product.

## Topology

\`\`\`mermaid
flowchart LR
  CLIENT["External client<br/>(SaaS, app, CLI)"]
  subgraph Container["Node.js container"]
    API["Express + Apollo<br/>GraphQL"]
    WORKER["BullMQ worker"]
  end
  PG[("PostgreSQL<br/>Queue, Task")]
  R[("Redis<br/>BullMQ broker")]
  EXT["External API<br/>(target)"]

  CLIENT -- JWT --> API
  API --> PG
  API -->|"enqueue"| R
  R --> WORKER
  WORKER --> PG
  WORKER -->|"HTTP"| EXT
\`\`\`

## Data schema

\`\`\`mermaid
erDiagram
  Queue ||--o{ Task : contains

  Queue {
    string id
    string name
    string description
    datetime createdAt
  }
  Task {
    string id
    string queueName
    string status
    int attempts
    int maxRetries
    string payload
    string queueId
    datetime createdAt
    datetime updatedAt
  }
\`\`\`

- \`Queue\` is the named queue (config + description)
- \`Task\` is each execution, with \`status\` (\`Pending | Processing | Done | Failed\`), \`attempts\`, \`maxRetries\` and \`payload\` (arbitrary JSON with URL, method, headers, body)

## Task lifecycle

\`\`\`mermaid
sequenceDiagram
  participant C as Client
  participant API as Apollo Server
  participant DB as Postgres
  participant Q as Redis (BullMQ)
  participant W as Worker
  participant EXT as External API

  C->>API: mutation enqueueTask(queue, payload)
  API->>DB: insert Task(status=Pending)
  API->>Q: add job(taskId)
  API-->>C: Task { id, status: "Pending" }

  Q->>W: job(taskId)
  W->>DB: load Task; update status=Processing
  W->>EXT: HTTP request
  alt success
    EXT-->>W: 2xx
    W->>DB: status=Done
  else failure
    EXT-->>W: 5xx / timeout
    W->>DB: attempts++
    alt attempts < maxRetries
      W->>Q: re-enqueue (exponential backoff)
    else
      W->>DB: status=Failed
    end
  end
\`\`\`

## Code layout

\`\`\`
src/
├── api/graphql.ts          # type defs + resolvers (Apollo)
├── queues/
│   ├── queueManager.ts     # queue create/lookup
│   └── taskProcessor.ts    # job executor function
├── lib/prisma.ts           # Prisma singleton client
└── utils/
    ├── authMiddleware.ts   # JWT (Express middleware)
    └── validator.ts        # payload validation
\`\`\`

## Technical decisions

- **GraphQL, not REST**: the client can fetch only the fields it needs from \`Task\` (\`id, status, attempts\`) without separate routes.
- **Same container for API + worker**: simplifies deploy on a small VPS. In production, scaling = a separate worker container.
- **Per-taskId idempotency**: the worker checks current status before processing; survives queue duplicates.
- **GraphQL JSON scalar**: the payload is arbitrary (URL, method, body), so \`graphql-type-json\` avoids a rigid schema. Validation lives in \`utils/validator.ts\`.

## Known limitations

- No multi-tenancy (one instance = one org)
- No dashboard (separate UI in \`request-orchestrator-ui\`)
- No dead-letter queue (failed tasks live only in Postgres)`,
  },

  features: [
    {
      title: { "pt-BR": "Mutations GraphQL para enfileirar tasks", en: "GraphQL mutations to enqueue tasks" },
      description: {
        "pt-BR":
          "`enqueueTask(queue, payload)` cria a Task no Postgres e enfileira no BullMQ. Status volta para o cliente para polling.",
        en: "`enqueueTask(queue, payload)` creates the Task in Postgres and enqueues in BullMQ. Status returns to the client for polling.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "Retry com backoff configurável", en: "Configurable retry with backoff" },
      description: {
        "pt-BR":
          "Cada task tem `maxRetries`. Falhas 5xx/timeout reenfileiram com backoff exponencial; 4xx desistem direto.",
        en: "Each task has `maxRetries`. 5xx/timeout failures re-enqueue with exponential backoff; 4xx fail fast.",
      },
      order: 2,
    },
    {
      title: { "pt-BR": "Idempotência por taskId", en: "Per-taskId idempotency" },
      description: {
        "pt-BR":
          "O worker checa o status atual antes de processar — sobrevive a duplicações da fila e restart do worker.",
        en: "The worker checks current status before processing — survives queue duplicates and worker restarts.",
      },
      order: 3,
    },
    {
      title: { "pt-BR": "JWT auth no middleware", en: "JWT auth middleware" },
      description: {
        "pt-BR":
          "`authMiddleware.ts` valida o token antes de qualquer resolver. Bloqueia chamadas anônimas.",
        en: "`authMiddleware.ts` validates the token before any resolver. Blocks anonymous calls.",
      },
      order: 4,
    },
  ],

  decisions: [
    {
      title: { "pt-BR": "GraphQL para a API pública", en: "GraphQL for the public API" },
      reason: { "pt-BR": "Cliente escolhe o shape da resposta sem rotas extras", en: "Client picks the response shape without extra routes" },
      description: {
        "pt-BR":
          "Uma única entrada `/graphql` cobre query (status), mutation (enqueue) e introspecção. Schema-first com Apollo.",
        en: "A single `/graphql` entry covers query (status), mutation (enqueue) and introspection. Schema-first with Apollo.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "Estado da task em Postgres + Redis", en: "Task state in Postgres + Redis" },
      reason: { "pt-BR": "Postgres é source-of-truth; Redis é só fila", en: "Postgres is source of truth; Redis is just the queue" },
      description: {
        "pt-BR":
          "O Postgres é consultado pelo cliente externo (audit trail); Redis sobrevive a flush sem perder histórico.",
        en: "Postgres is queried by the external client (audit trail); Redis can flush without losing history.",
      },
      order: 2,
    },
  ],
};
