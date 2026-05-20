import type { ProjectPayload } from "../project-upsert";

export const coffeeDelivery: ProjectPayload = {
  slug: "coffee-delivery",
  title: "Coffee Delivery",
  shortDescription:
    "Exercício de frontend React (curso Ignite) — e-commerce de café com carrinho global, ViaCep e roteamento.",
  category: "frontend",
  status: "shipped",
  year: 2023,
  featured: false,
  order: 12,
  demoUrl: "https://coffee-delivery-ashen.vercel.app",
  githubUrl: "https://github.com/devalexsantos/coffee-delivery",
  techSlugs: ["react", "typescript"],

  content: {
    "pt-BR": {
      fullDescription:
        "Projeto do curso Ignite (Rocketseat) reproduzido com customizações próprias: um e-commerce de café com showcase de produtos, carrinho global por Context API, edição de quantidades, integração com a API ViaCep para autopreenchimento do endereço a partir do CEP, e tela de confirmação do pedido. Construído com Vite + React + TypeScript + Styled Components + React Router.",
      problem:
        "Reforçar fundamentos de React após estudar formalmente: state global, formulários controlados, integração com API externa, roteamento, persistência leve em memória. Sem pular para Next ou abstrações pesadas, pra entender o que o framework de cima realmente faz.",
      hypothesis:
        "Implementar um e-commerce completo no Vite, sem Next/Remix, deixa claro quais problemas o framework resolve (data fetching, routing baseado em arquivos, RSC) e quais o React puro já resolve bem (componentes, estado local, contexto).",
      targetAudience:
        "Eu mesmo, em fase de estudo intensivo da Rocketseat em 2023. O projeto está hospedado público para servir de referência futura.",
      technicalDecisions:
        "Vite pela velocidade do dev server e build. Context API + Reducer para o carrinho — sem Redux nem Zustand porque o escopo do projeto não justifica. Styled Components pelo padrão da Rocketseat na época. Axios para chamadas ViaCep. React Router v6 para o fluxo home → carrinho → confirmação.",
      learnings:
        "A pegadinha do projeto está em manter o estado do carrinho sincronizado entre showcase, página de carrinho e confirmação — três rotas diferentes, três componentes que precisam ler e mutar o mesmo state. Resolvi com um único Context envolvendo o Router. Outro aprendizado: validação de formulário sem lib (Formik, RHF) é tedioso mas mostra o que essas libs estão escondendo.",
      nextSteps:
        "Hoje rescreveria com Next.js + Server Components para dados de produto, mantendo só o carrinho client-side. Adicionaria responsividade mobile e checkout real (Stripe).",
    },
    en: {
      fullDescription:
        "A project from the Ignite (Rocketseat) course, recreated with my own twists: a coffee e-commerce with product showcase, global cart via Context API, quantity editing, ViaCep API integration for autofilling address from postal code, and an order confirmation screen. Built with Vite + React + TypeScript + Styled Components + React Router.",
      problem:
        "Reinforce React fundamentals after formal study: global state, controlled forms, external API integration, routing, light in-memory persistence. Without jumping to Next or heavy abstractions, to understand what the higher framework actually does.",
      hypothesis:
        "Implementing a full e-commerce in Vite (no Next/Remix) makes it clear which problems the framework solves (data fetching, file-based routing, RSC) and which plain React already covers (components, local state, context).",
      targetAudience:
        "Myself, during intensive Rocketseat study in 2023. The project is hosted publicly to serve as future reference.",
      technicalDecisions:
        "Vite for dev server and build speed. Context API + Reducer for the cart — no Redux or Zustand, scope didn't justify it. Styled Components per Rocketseat's standard at the time. Axios for ViaCep calls. React Router v6 for the home → cart → confirmation flow.",
      learnings:
        "The trick is keeping cart state in sync across showcase, cart page, and confirmation — three different routes, three components reading and mutating the same state. Solved with a single Context wrapping the Router. Another lesson: form validation without a lib (Formik, RHF) is tedious but shows what those libraries hide.",
      nextSteps:
        "Today I'd rewrite with Next.js + Server Components for product data, keeping just the cart client-side. Add mobile responsive and real checkout (Stripe).",
    },
  },

  architecture: {
    "pt-BR":
      "App React single-page com Vite. Estrutura: `Router` na raiz envolve `CartContextProvider`, que sustenta o reducer do carrinho. Páginas: `Home` (catálogo + add ao carrinho), `Cart` (revisão + endereço + ViaCep + pagamento), `Success` (confirmação). Styled Components fornece tema único, e cada componente tem seu arquivo de styles colocado próximo. Sem state management externo nem cache de servidor — escopo intencional.",
    en: "Single-page React app with Vite. Layout: a root `Router` wraps `CartContextProvider`, which holds the cart reducer. Pages: `Home` (catalog + add to cart), `Cart` (review + address + ViaCep + payment), `Success` (confirmation). Styled Components provides a single theme, with style files colocated next to each component. No external state management or server cache — intentional scope.",
  },

  challenges: {
    "pt-BR":
      "1) **Estado do carrinho atravessando três rotas** — resolvi com Context único acima do Router. 2) **Integração com ViaCep** sem perder UX se o CEP for inválido — debounce + feedback inline. 3) **Edição de quantidade no carrinho** com remoção automática quando vai a zero — pequeno mas precisa ser sólido para não 'sumir' itens indesejadamente.",
    en: "1) **Cart state across three routes** — solved with a single Context above the Router. 2) **ViaCep integration** without breaking UX on invalid postal codes — debounce + inline feedback. 3) **Quantity editing in the cart** with auto-remove when it hits zero — small but must be solid so items don't 'disappear' unexpectedly.",
  },

  readme: {
    "pt-BR": `# Coffee Delivery — detalhamento técnico

Projeto de estudo do curso Ignite (Rocketseat). Está aqui no portfólio menos pelo produto e mais pelo que ele representa: o ponto em que parei de copiar tutorial e comecei a entender por que cada parte existe.

## Fluxo de telas

\`\`\`mermaid
flowchart LR
  HOME["Home<br/>showcase + add ao carrinho"]
  CART["Carrinho<br/>quantidades + endereço (ViaCep)"]
  SUCCESS["Confirmação<br/>pedido + entrega"]
  HOME -- "ir para carrinho" --> CART
  CART -- "finalizar pedido" --> SUCCESS
  CART -- "voltar" --> HOME
\`\`\`

## Estrutura do estado

\`\`\`mermaid
flowchart TB
  ROUTER["Router (React Router v6)"]
  CTX["CartContextProvider<br/>useReducer"]
  HOME["&lt;Home /&gt;<br/>dispatch ADD_ITEM"]
  CART["&lt;Cart /&gt;<br/>dispatch CHANGE_QTY, REMOVE_ITEM"]
  SUCCESS["&lt;Success /&gt;<br/>read order"]

  ROUTER --> CTX
  CTX --> HOME
  CTX --> CART
  CTX --> SUCCESS
\`\`\`

\`Context\` está acima do \`Router\` para sobreviver à navegação. O reducer aceita actions: \`ADD_ITEM\`, \`CHANGE_QTY\` (com auto-remove se quantidade ficar 0), \`REMOVE_ITEM\`, \`CLEAR_CART\`.

## Integração com ViaCep

\`\`\`mermaid
sequenceDiagram
  participant U as Usuário
  participant F as Formulário
  participant V as ViaCep API
  U->>F: digita CEP
  F->>F: debounce 400ms
  F->>V: GET https://viacep.com.br/ws/{cep}/json/
  alt válido
    V-->>F: { logradouro, bairro, cidade, uf }
    F->>F: preenche campos
  else inválido
    V-->>F: { erro: true }
    F->>F: mostra mensagem inline
  end
\`\`\`

## Stack

| Camada | Tecnologia |
|---|---|
| Build | Vite |
| UI | React 18 + TypeScript |
| Estilo | Styled Components |
| Roteamento | React Router v6 |
| HTTP | Axios |
| Estado | Context API + useReducer |
| Ícones | Phosphor Icons |

## Decisões técnicas

- **Sem Next.js**: estava aprendendo React puro; o framework esconderia o routing e o data fetching que eu queria praticar.
- **Sem Redux/Zustand**: a complexidade do carrinho cabe em um reducer; importar uma lib seria over-engineering.
- **Styled Components**: padrão da Rocketseat na época. Hoje eu usaria Tailwind, mas o pattern de \`styled.div\` ensina bem CSS-in-JS.
- **Sem testes**: omissão consciente — era estudo de UI, não de qualidade de produção.

## O que faria diferente hoje

- Migrar para Next.js + Server Components para os dados do catálogo
- Substituir Styled Components por Tailwind v4
- Adicionar React Hook Form + Zod no formulário de endereço
- Implementar responsividade mobile
- Adicionar checkout real (Stripe)`,
    en: `# Coffee Delivery — technical deep dive

Study project from the Ignite (Rocketseat) course. It's in this portfolio less for the product and more for what it represents: the point where I stopped copying tutorials and started understanding why each part exists.

## Screen flow

\`\`\`mermaid
flowchart LR
  HOME["Home<br/>showcase + add to cart"]
  CART["Cart<br/>quantities + address (ViaCep)"]
  SUCCESS["Confirmation<br/>order + delivery"]
  HOME -- "go to cart" --> CART
  CART -- "finish order" --> SUCCESS
  CART -- "back" --> HOME
\`\`\`

## State shape

\`\`\`mermaid
flowchart TB
  ROUTER["Router (React Router v6)"]
  CTX["CartContextProvider<br/>useReducer"]
  HOME["&lt;Home /&gt;<br/>dispatch ADD_ITEM"]
  CART["&lt;Cart /&gt;<br/>dispatch CHANGE_QTY, REMOVE_ITEM"]
  SUCCESS["&lt;Success /&gt;<br/>read order"]

  ROUTER --> CTX
  CTX --> HOME
  CTX --> CART
  CTX --> SUCCESS
\`\`\`

\`Context\` lives above the \`Router\` so it survives navigation. The reducer accepts: \`ADD_ITEM\`, \`CHANGE_QTY\` (auto-removes when quantity hits 0), \`REMOVE_ITEM\`, \`CLEAR_CART\`.

## ViaCep integration

\`\`\`mermaid
sequenceDiagram
  participant U as User
  participant F as Form
  participant V as ViaCep API
  U->>F: types ZIP
  F->>F: debounce 400ms
  F->>V: GET https://viacep.com.br/ws/{cep}/json/
  alt valid
    V-->>F: { logradouro, bairro, cidade, uf }
    F->>F: fills fields
  else invalid
    V-->>F: { erro: true }
    F->>F: shows inline message
  end
\`\`\`

## Stack

| Layer | Tech |
|---|---|
| Build | Vite |
| UI | React 18 + TypeScript |
| Styling | Styled Components |
| Routing | React Router v6 |
| HTTP | Axios |
| State | Context API + useReducer |
| Icons | Phosphor Icons |

## Technical decisions

- **No Next.js**: I was learning plain React; the framework would hide the routing and data fetching I wanted to practice.
- **No Redux/Zustand**: the cart complexity fits in a reducer; importing a lib would be overkill.
- **Styled Components**: Rocketseat's standard at the time. Today I'd use Tailwind, but the \`styled.div\` pattern is good CSS-in-JS teaching.
- **No tests**: conscious omission — this was UI study, not production-quality.

## What I'd do differently today

- Migrate to Next.js + Server Components for the catalog
- Replace Styled Components with Tailwind v4
- Add React Hook Form + Zod to the address form
- Add mobile responsiveness
- Add a real checkout (Stripe)`,
  },

  features: [
    {
      title: { "pt-BR": "Carrinho global por Context", en: "Global cart via Context" },
      description: {
        "pt-BR":
          "Único Context acima do Router. Reducer com `ADD_ITEM`, `CHANGE_QTY`, `REMOVE_ITEM`. Estado sobrevive à navegação.",
        en: "Single Context above the Router. Reducer with `ADD_ITEM`, `CHANGE_QTY`, `REMOVE_ITEM`. State survives navigation.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "Autopreenchimento via ViaCep", en: "Autofill via ViaCep" },
      description: {
        "pt-BR":
          "Debounce 400ms ao digitar o CEP. Preenche logradouro/bairro/cidade/UF automaticamente.",
        en: "400ms debounce as the postal code is typed. Auto-fills street/neighborhood/city/state.",
      },
      order: 2,
    },
    {
      title: { "pt-BR": "Fluxo home → carrinho → confirmação", en: "Home → cart → confirmation flow" },
      description: {
        "pt-BR":
          "Três rotas no React Router v6. Confirmação mostra resumo do pedido com dados do endereço.",
        en: "Three routes in React Router v6. Confirmation shows order summary with address data.",
      },
      order: 3,
    },
  ],

  decisions: [
    {
      title: { "pt-BR": "Sem state manager externo", en: "No external state manager" },
      reason: { "pt-BR": "Escopo do carrinho cabe num useReducer", en: "Cart scope fits in a useReducer" },
      description: {
        "pt-BR":
          "Importar Redux/Zustand para 1 carrinho seria over-engineering; Context + useReducer cobre.",
        en: "Pulling in Redux/Zustand for one cart would be overkill; Context + useReducer covers it.",
      },
      order: 1,
    },
    {
      title: { "pt-BR": "Vite em vez de Next", en: "Vite instead of Next" },
      reason: { "pt-BR": "Estudo de React puro, sem abstrações do framework", en: "Plain React study, without framework abstractions" },
      description: {
        "pt-BR":
          "O objetivo era entender estado, roteamento e fetch manualmente. Hoje o produto pediria Next.js.",
        en: "Goal was to understand state, routing and fetch manually. Today this product would call for Next.js.",
      },
      order: 2,
    },
  ],
};
