# Plano Detalhado — Portfólio Dev com IA, RAG e Design Premium

## 1. Visão geral do projeto

Criar um site pessoal/portfólio de desenvolvedor fullstack com forte apelo visual, estética dark/roxo, moderna, tecnológica e relacionada à inteligência artificial. O site deve apresentar projetos reais, raciocínio técnico, decisões de produto, blog/build notes e recursos interativos com IA.

O objetivo não é criar apenas um currículo online, mas sim um produto completo que demonstre:

- domínio técnico em Next.js, React, TypeScript, Node.js, Postgres, Redis, Docker e IA;
- capacidade de pensar produto, arquitetura e negócio;
- experiência prática com SaaS, RAG, pgvector, automações e deploy em VPS;
- capacidade de criar interfaces modernas, performáticas e memoráveis;
- clareza de comunicação para recrutadores, clientes e parceiros.

O site deve funcionar como uma demonstração real das habilidades do desenvolvedor.

---

## 2. Stack obrigatória

### Frontend

- Next.js com App Router
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- Framer Motion
- Lucide React
- React Hook Form
- Zod
- TanStack Query, se necessário

### Backend

Pode ser feito dentro do próprio Next.js usando Route Handlers, Server Actions e Server Components.

- Next.js API Routes / Route Handlers
- Prisma ORM
- PostgreSQL
- pgvector
- Redis
- Docker
- Docker Compose

### IA / RAG

- OpenAI como provider
- Embeddings para conteúdo do portfólio
- RAG usando Postgres + pgvector
- Chat contextual sobre projetos, experiência e posts
- Respostas com base em dados cadastrados no banco

### Infraestrutura

- Preparado para deploy em VPS
- Deploy via EasyPanel
- Sem dependência da Vercel
- Dockerfile de produção
- docker-compose para ambiente local
- Variáveis de ambiente via `.env`
- Banco Postgres com extensão pgvector
- Redis para cache, rate limit e sessões temporárias se necessário

---

## 3. Conceito visual

O layout deve ser dark (tons de cinza escuro), moderno, premium e tecnológico, com estética que remeta a IA, SaaS, cloud, dados e produtos digitais.

### Direção visual

- Background principal escuro, quase preto
- Gradientes em roxo, violeta, azul profundo e magenta discreto
- Cards com glassmorphism sutil
- Bordas finas com transparência
- Glow effects moderados
- Elementos abstratos de rede neural, grid, partículas ou circuitos
- Microinterações elegantes
- Animações suaves e performáticas
- Tipografia grande, limpa e com hierarquia forte
- Aparência de produto SaaS premium

### Inspiração estética

O site deve parecer algo entre:

- landing page de produto de IA;
- portfólio premium de desenvolvedor senior;
- dashboard futurista;
- laboratório de experimentos técnicos;
- página institucional de startup SaaS moderna.

Evitar visual genérico de template comum.

---

## 4. Objetivos principais

O site deve responder rapidamente às perguntas:

1. Quem é Alex Santos?
2. O que ele constrói?
3. Quais projetos ele já criou?
4. Como ele pensa tecnicamente?
5. Como ele usa IA de forma prática?
6. Qual stack domina?
7. Por que um recrutador ou cliente deveria falar com ele?
8. Quais problemas ele sabe resolver?

---

## 5. Funcionalidades principais

## 5.1 Home page

A home deve ser extremamente impactante.

### Seções da home

1. Hero section
2. AI Portfolio Assistant
3. Projetos em destaque
4. Como eu construo produtos
5. Stack principal
6. Build Notes recentes
7. Experimentos com IA
8. CTA de contato

### Hero section

Deve conter:

- headline forte;
- subtítulo objetivo;
- animação visual relacionada a IA;
- botões de ação;
- mini status profissional;
- preview do assistant ou projetos.

Sugestão de headline:

> Eu construo produtos digitais com Next.js, IA e mentalidade de produto.

Sugestão alternativa:

> Fullstack Developer criando SaaS, experiências com IA e sistemas web escaláveis.

Sugestão de subtítulo:

> Transformo ideias em produtos reais usando Next.js, TypeScript, Node.js, Postgres, pgvector, Docker e integrações inteligentes com IA.

### CTAs

- Ver projetos
- Perguntar para a IA
- Ler build notes
- Entrar em contato

---

## 5.2 AI Portfolio Assistant

Criar um chat com IA dentro do site que responda perguntas sobre Alex, seus projetos, stack, experiências, posts e raciocínio técnico.

### Objetivo

Permitir que recrutadores, clientes ou visitantes façam perguntas como:

- Qual projeto do Alex usa IA?
- Quais experiências ele tem com Next.js?
- Ele já trabalhou com SaaS?
- Explique o projeto ZeroChat.
- Mostre projetos com Prisma e Postgres.
- Resuma o perfil dele para uma vaga de Frontend Developer.
- Quais projetos demonstram arquitetura fullstack?
- Ele tem experiência com deploy em VPS?
- Quais problemas ele sabe resolver?

### Comportamento esperado

O assistant deve:

- responder somente com base no conteúdo indexado;
- citar projetos e posts relevantes;
- sugerir links internos para páginas do site;
- evitar inventar experiências inexistentes;
- assumir que é um assistente do portfólio de Alex;
- ter tom profissional, direto e confiante;
- conseguir resumir o perfil de Alex para tipos diferentes de vaga.

### Interface do chat

- card premium com efeito glassmorphism;
- mensagens com animação suave;
- sugestões de perguntas prontas;
- estado de loading moderno;
- feedback de erro amigável;
- limite de uso por IP;
- histórico local curto no browser;
- opção de limpar conversa.

### Implementação técnica

Criar uma pipeline RAG:

1. Conteúdos são cadastrados no banco:
   - projetos;
   - posts;
   - experiências;
   - stack;
   - decisões técnicas;
   - FAQs;
   - páginas institucionais.

2. Cada conteúdo gera embedding.

3. Embedding é salvo no Postgres usando pgvector.

4. Ao receber uma pergunta:
   - gerar embedding da pergunta;
   - buscar chunks similares no banco;
   - montar contexto;
   - enviar para LLM;
   - retornar resposta contextual.

### Tabelas relacionadas

- ai_documents
- ai_chunks
- ai_chat_messages
- ai_feedback

### Rate limit

Usar Redis para limitar abuso:

- limite por IP;
- limite diário;
- limite por minuto;
- fallback amigável.

---

## 5.3 Página de projetos

Criar página geral de projetos com filtros e cards ricos.

### Filtros

- Todos
- SaaS
- IA
- Frontend
- Fullstack
- Automação
- Infra
- Experimentos
- Produção
- MVP

### Cada card deve exibir

- nome do projeto;
- descrição curta;
- status;
- stack;
- categoria;
- ano;
- destaque técnico;
- links para demo, GitHub ou case study;
- animação hover;
- visual diferenciado.

### Projetos iniciais sugeridos

1. AdvLink
2. ZeroChat
3. Tunify
4. Gitcatch
5. Karmic / Reddit Reports
6. AI Reply System
7. ShopFinder
8. Cartinhas GG / projeto de análise de LoL
9. Sistema de cortes de vídeos com IA
10. App interno de cold email inspirado no Instantly

---

## 5.4 Página individual de projeto — Case Study

Cada projeto deve ter uma página detalhada no formato de estudo de caso.

### Estrutura obrigatória

1. Hero do projeto
2. Visão geral
3. Problema
4. Hipótese
5. Público-alvo
6. Stack utilizada
7. Arquitetura
8. Decisões técnicas
9. Principais funcionalidades
10. Desafios encontrados
11. Como a IA entra no projeto, quando aplicável
12. Prints ou demos
13. Resultados / aprendizados
14. Próximos passos
15. Pergunte à IA sobre este projeto

### Exemplo de estrutura para AdvLink

```md
# AdvLink

## Problema
Advogados precisam de presença digital profissional, rápida e acessível.

## Hipótese
Um site builder nichado para advogados pode converter melhor do que plataformas genéricas.

## Stack
Next.js, TypeScript, Prisma, Postgres, Cloudflare, Docker, EasyPanel.

## Decisões técnicas
- Arquitetura multi-tenant
- Subdomínios por usuário
- Blog separado da aplicação principal
- SEO local como parte do produto
- Analytics para donos dos sites

## Aprendizados
- Redução de fricção no onboarding
- Importância de nicho em SaaS
- Infra com VPS como alternativa à Vercel
```

---

## 5.5 Project Intelligence

Dentro de cada página de projeto, criar um mini assistant contextual chamado “Ask this project”.

### Objetivo

Permitir perguntas específicas sobre um projeto.

Exemplos:

- Qual foi o maior desafio técnico?
- Como esse projeto escala?
- Por que essa stack foi escolhida?
- Como a IA é usada aqui?
- Que melhorias futuras seriam feitas?

### Comportamento

O assistant deve buscar contexto apenas relacionado ao projeto atual.

### Interface

- componente compacto;
- sugestões de perguntas;
- resposta em markdown;
- links internos para posts relacionados.

---

## 5.6 Blog / Build Notes

Criar uma área de blog focada em raciocínio técnico, produto, arquitetura e IA.

### Nome sugerido

- Build Notes
- Dev Lab
- Product Engineering Notes
- Behind the Build
- Como eu construo

### Categorias

- Arquitetura
- IA
- SaaS
- Frontend
- Backend
- Infra
- Produto
- Experimentos
- Deploy
- Performance

### Posts iniciais sugeridos

1. Como pensei a arquitetura multi-tenant do AdvLink
2. Por que pivotei ShopFinder para ZeroChat
3. Como usar pgvector para uma base de conhecimento com IA
4. Minha stack para construir MVPs rápido
5. VPS + EasyPanel vs Vercel: por que escolhi VPS
6. Como eu criaria um SaaS com planos e limites de uso
7. Como usar IA no fluxo de desenvolvimento sem perder controle técnico
8. Como estruturar um chat RAG com Next.js, Postgres e pgvector
9. Como eu penso SEO para produtos SaaS
10. Como criar demos interativas para um portfólio técnico

### Funcionalidades do blog

- listagem com filtros por categoria;
- página individual de post;
- leitura agradável;
- tempo estimado de leitura;
- posts relacionados;
- índice lateral para desktop;
- suporte a markdown ou conteúdo vindo do banco;
- conteúdo indexável no RAG;
- SEO com metadata por post.

---

## 5.7 Página “How I Build”

Criar uma página explicando o processo de trabalho do desenvolvedor.

### Estrutura

1. Descoberta do problema
2. Hipótese de produto
3. Definição do MVP
4. Arquitetura técnica
5. Design system
6. Desenvolvimento frontend
7. Desenvolvimento backend
8. Integração com IA
9. Deploy e observabilidade
10. Iteração com base em feedback

### Objetivo

Mostrar para recrutadores e clientes como Alex pensa e trabalha.

### Conteúdo esperado

Explicar que Alex atua como builder fullstack capaz de:

- entender problema de negócio;
- propor arquitetura;
- desenvolver frontend e backend;
- integrar IA;
- cuidar de deploy;
- pensar produto e conversão;
- melhorar continuamente.

---

## 5.8 Página “Stack”

Criar uma página visual com tecnologias dominadas.

### Categorias

- Frontend
- Backend
- Banco de dados
- IA
- DevOps
- Infra
- Automação
- E-mail e pagamentos
- Testing

### Tecnologias

Frontend:

- Next.js
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- Framer Motion
- React Hook Form
- TanStack Query

Backend:

- Node.js
- Fastify
- Next.js Route Handlers
- Prisma
- Zod

Database:

- PostgreSQL
- pgvector
- Redis

IA:

- OpenAI
- OpenRouter
- RAG
- Embeddings
- LLM integrations

Infra:

- Docker
- Docker Compose
- EasyPanel
- VPS
- Cloudflare
- Nginx / reverse proxy, se aplicável

Outros:

- Stripe
- Resend
- n8n
- GitHub
- CI/CD

### Cada tecnologia deve ter

- nome;
- categoria;
- nível de experiência;
- onde foi usada;
- link para projeto relacionado.

---

## 5.9 Página “Experimentos”

Criar uma área para ideias, protótipos e explorações.

### Exemplos

- AI Reply System
- gerador de wallpapers com IA
- análise de partidas de LoL com IA
- sistema de cortes de vídeo com transcrição
- assistente para Reddit marketing
- gerador de páginas com IA
- cold email automation
- scrapers com seletores gerados por LLM

### Objetivo

Mostrar curiosidade técnica, capacidade de prototipar e conexão com tendências atuais.

---

## 5.10 Recruiter Mode

Criar uma funcionalidade chamada “Recruiter Mode”.

### Objetivo

Permitir que o recrutador selecione um tipo de vaga e receba um resumo personalizado do perfil.

### Opções

- Frontend Developer
- Fullstack Developer
- Product Engineer
- AI Engineer
- SaaS Builder
- Startup Developer

### Saída esperada

Gerar resumo com:

- principais pontos fortes;
- projetos mais relevantes;
- stacks relacionadas;
- por que Alex se encaixa na vaga;
- links internos úteis;
- CTA para contato.

### Implementação

Pode usar IA ou templates inteligentes.

Preferência:

- primeira versão com templates estáticos;
- segunda versão com IA usando RAG.

---

## Suporte a Idiomas / Internacionalização (pt-BR e EN)

O portfólio deverá ser desenvolvido com suporte multilíngue desde o início, contemplando inicialmente dois idiomas:

- Português do Brasil (`pt-BR`)
- Inglês (`en`)

A internacionalização é importante porque o portfólio poderá ser acessado tanto por recrutadores, empresas e clientes brasileiros quanto por oportunidades internacionais.

### Objetivo

Permitir que todo o conteúdo público do portfólio esteja disponível em português e inglês, incluindo:

- Home
- Página Sobre
- Projetos
- Estudos de caso
- Blog / Build Notes
- Stack
- Seção “How I Build”
- Playground de IA
- Mensagens do AI Portfolio Assistant
- Metadata de SEO
- Open Graph
- Botões, menus, labels e textos de interface

### Estratégia Técnica Recomendada

Utilizar uma solução robusta de i18n compatível com Next.js App Router.

Sugestão principal:

- `next-intl`

Estrutura recomendada:

```txt
src/
├── app/
│   └── [locale]/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── projects/
│       ├── blog/
│       ├── about/
│       └── playground/
├── i18n/
│   ├── routing.ts
│   ├── request.ts
│   └── navigation.ts
├── messages/
│   ├── pt-BR.json
│   └── en.json

Rotas Localizadas
/pt-BR
/pt-BR/projetos
/pt-BR/blog
/pt-BR/sobre

/en
/en/projects
/en/blog
/en/about

Para manter a experiência mais natural, o sistema pode ter slugs traduzidos nas páginas principais, quando fizer sentido.

Exemplos:
/pt-BR/projetos/advlink
/en/projects/advlink

/pt-BR/sobre
/en/about

Seletor de Idioma

O layout deverá conter um seletor de idioma visível e elegante, preferencialmente no header ou menu mobile.

As URLs devem refletir o idioma selecionado:
Requisitos:

Alternar entre pt-BR e en
Manter o usuário na página equivalente sempre que possível
Salvar preferência em cookie
Detectar idioma inicial com base no navegador, quando aplicável
Ter fallback seguro para pt-BR
Exemplo de comportamento:

Usuário está em:
/pt-BR/projetos/zerochat

Ao trocar para inglês, redirecionar para:
/en/projects/zerochat

Conteúdo dos Projetos

Cada projeto deverá possuir conteúdo traduzível.

JSON localizado
type Project = {
  id: string
  slug: string
  content: {
    "pt-BR": {
      title: string
      shortDescription: string
      problem: string
      solution: string
      technicalDecisions: string
      learnings: string
    }
    "en": {
      title: string
      shortDescription: string
      problem: string
      solution: string
      technicalDecisions: string
      learnings: string
    }
  }
}

Blog / Build Notes

Os posts do blog também deverão suportar tradução.

Cada post poderá ter:

type BlogPost = {
  id: string
  slug: string
  locale: "pt-BR" | "en"
  translationGroupId: string
  title: string
  excerpt: string
  content: string
  seoTitle: string
  seoDescription: string
}

O campo translationGroupId servirá para relacionar a versão em português e a versão em inglês do mesmo conteúdo.

Exemplo:

Post em pt-BR:
translationGroupId: "how-i-build-saas"

Post em EN:
translationGroupId: "how-i-build-saas"
IA e RAG com Suporte Multilíngue

O AI Portfolio Assistant deverá responder no idioma atual da interface.

Se o usuário estiver em /pt-BR, o assistente responde em português.

Se o usuário estiver em /en, o assistente responde em inglês.

Requisitos:

Enviar o locale atual junto na chamada da API do chat
Incluir no system prompt a instrução de responder no idioma selecionado
Indexar conteúdos em português e inglês no banco vetorial
Salvar o idioma do conteúdo no metadata dos embeddings
Priorizar chunks do mesmo idioma da interface
Usar fallback para outro idioma caso não exista conteúdo traduzido suficiente

Exemplo de metadata para embeddings:

type EmbeddingMetadata = {
  sourceType: "project" | "blog_post" | "profile" | "experience"
  sourceId: string
  locale: "pt-BR" | "en"
  title: string
  slug: string
}

Exemplo de filtro RAG:

where: {
  locale: currentLocale
}

Caso não encontre contexto suficiente no idioma atual, permitir fallback controlado:

1. Buscar chunks no idioma atual
2. Se a similaridade for baixa ou houver poucos resultados, buscar no outro idioma
3. Responder sempre no idioma atual da interface
4. Nunca misturar idiomas na resposta final
SEO Multilíngue

Cada página deverá gerar metadados específicos por idioma.

Requisitos:

title localizado
description localizada
openGraph localizado
alternates.languages
hreflang
URL canônica por idioma

Exemplo:

export const metadata = {
  alternates: {
    canonical: "/pt-BR",
    languages: {
      "pt-BR": "/pt-BR",
      "en": "/en",
    },
  },
}
Admin / CMS Interno

Caso exista um painel admin para cadastrar projetos, posts e conteúdos do portfólio, ele deverá permitir gerenciar os dois idiomas.

Requisitos:

Campos separados por idioma na interface
Abas Português e English
Validação indicando conteúdo pendente de tradução
Status de tradução:
draft
needs_translation
translated
reviewed
Preview da página nos dois idiomas
Botão opcional para gerar rascunho de tradução com IA
Tradução com IA

O sistema poderá ter uma funcionalidade interna para auxiliar na tradução dos conteúdos.

Fluxo sugerido:

1. Admin cadastra conteúdo em pt-BR
2. Clica em “Gerar tradução em inglês”
3. IA gera uma primeira versão
4. Admin revisa manualmente
5. Conteúdo é marcado como reviewed
6. Página em inglês é publicada

A tradução com IA nunca deve ser publicada automaticamente sem revisão.

Design e UX

O seletor de idioma deve manter o conceito visual do site:

Dark mode
Roxo/neon
Estética tecnológica
Microinterações
Animação suave ao trocar idioma
Ícones simples de idioma, como PT e EN
Evitar bandeiras como única representação de idioma

Exemplo de UI:

[ PT-BR ▼ ]

Opções:
- Português
- English

Ou:

PT | EN
Fallbacks

Definir comportamento seguro para conteúdos ausentes.

Regras:

Se uma página não existir em inglês, exibir versão em português com aviso discreto apenas no admin, não no público
No público, evitar mostrar conteúdo quebrado
Para produção, idealmente só publicar páginas traduzidas/revisadas
O idioma padrão será pt-BR
Critérios de Aceite
Usuário consegue alternar entre português e inglês
Todas as páginas públicas têm textos traduzidos
URLs são localizadas
SEO possui hreflang
AI Portfolio Assistant responde no idioma da interface
RAG prioriza conteúdos no idioma atual
Admin permite gerenciar conteúdo nos dois idiomas
O site possui fallback seguro para conteúdo ainda não traduzido
A preferência de idioma é persistida
O idioma inicial pode ser detectado pelo navegador

## 6. Admin interno

Criar um painel admin simples para gerenciar o conteúdo do portfólio.

### Autenticação

Como é um projeto pessoal, pode começar com autenticação simples:

- senha admin via variável de ambiente;
- sessão via cookie httpOnly;
- middleware protegendo `/admin`.

Não precisa implementar auth complexa inicialmente.

### Funcionalidades admin

- CRUD de projetos
- CRUD de posts
- CRUD de experiências
- CRUD de stacks
- CRUD de documentos para IA
- botão para gerar embeddings
- botão para reindexar conteúdo
- visualizar chunks gerados
- visualizar perguntas feitas ao assistant
- visualizar feedbacks

### Páginas admin

- `/admin/login`
- `/admin`
- `/admin/projects`
- `/admin/posts`
- `/admin/stack`
- `/admin/ai-documents`
- `/admin/chat-logs`

---

## 7. Banco de dados

Usar Prisma com PostgreSQL.

### Models sugeridos

#### UserAdmin

Mesmo que exista apenas um admin, manter estrutura mínima.

Campos:

- id
- email
- passwordHash, opcional caso não use env password
- createdAt
- updatedAt

#### Project

Campos:

- id
- slug
- title
- shortDescription
- fullDescription
- problem
- hypothesis
- targetAudience
- status
- category
- year
- coverImage
- demoUrl
- githubUrl
- featured
- order
- createdAt
- updatedAt

#### ProjectFeature

Campos:

- id
- projectId
- title
- description
- order

#### ProjectDecision

Campos:

- id
- projectId
- title
- description
- reason
- order

#### ProjectStack

Campos:

- id
- projectId
- technologyId

#### Technology

Campos:

- id
- name
- slug
- category
- icon
- experienceLevel
- description
- createdAt
- updatedAt

#### Post

Campos:

- id
- slug
- title
- excerpt
- content
- category
- tags
- published
- publishedAt
- readingTime
- coverImage
- createdAt
- updatedAt

#### AiDocument

Campos:

- id
- title
- type
- sourceId
- sourceType
- content
- metadata
- indexed
- createdAt
- updatedAt

#### AiChunk

Campos:

- id
- documentId
- content
- embedding vector
- metadata
- createdAt

#### AiChatMessage

Campos:

- id
- sessionId
- role
- content
- ipHash
- createdAt

#### AiFeedback

Campos:

- id
- messageId
- rating
- comment
- createdAt

#### ContactMessage

Campos:

- id
- name
- email
- subject
- message
- createdAt

---

## 8. pgvector

### Requisito

Postgres precisa ter extensão vector habilitada.

Criar migration SQL:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Campo de embedding

No Prisma, usar o tipo Unsupported inicialmente:

```prisma
model AiChunk {
  id         String   @id @default(cuid())
  documentId String
  content    String
  embedding  Unsupported("vector(1536)")?
  metadata   Json?
  createdAt  DateTime @default(now())

  document AiDocument @relation(fields: [documentId], references: [id], onDelete: Cascade)
}
```

A dimensão do vector deve ser compatível com o modelo de embedding escolhido.

Exemplos:

- OpenAI text-embedding-3-small: 1536
- OpenAI text-embedding-3-large: 3072

Configurar via env.

---

## 9. RAG — fluxo detalhado

### Indexação

Criar serviço `indexDocument`:

1. receber documento;
2. quebrar em chunks;
3. gerar embedding de cada chunk;
4. salvar no banco;
5. marcar documento como indexado.

### Chunking

Criar chunks com:

- 500 a 1000 tokens;
- overlap de 100 a 150 tokens;
- preservar contexto de título, projeto e categoria;
- metadados ricos.

### Busca

Criar serviço `searchSimilarChunks`:

1. gerar embedding da pergunta;
2. buscar no Postgres por similaridade;
3. retornar top K chunks;
4. aplicar threshold mínimo;
5. montar contexto.

### Resposta

Prompt base:

```txt
Você é o assistente oficial do portfólio de Alex Santos.
Responda com base apenas no contexto fornecido.
Se não souber, diga que não encontrou informação suficiente.
Se fizer sentido, recomende links internos para projetos ou posts.
Seja claro, profissional e objetivo.
```

---

## 10. Redis

Usar Redis para:

- rate limit do chat;
- cache de respostas frequentes;
- controle temporário de sessões;
- proteção contra abuso.

### Rate limit sugerido

- 10 mensagens por minuto por IP;
- 50 mensagens por dia por IP;
- opção de aumentar futuramente.

---

## 11. API Routes sugeridas

### Públicas

- `GET /api/projects`
- `GET /api/projects/:slug`
- `GET /api/posts`
- `GET /api/posts/:slug`
- `POST /api/chat`
- `POST /api/contact`
- `POST /api/recruiter-summary`

### Admin

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `POST /api/admin/projects`
- `PUT /api/admin/projects/:id`
- `DELETE /api/admin/projects/:id`
- `POST /api/admin/posts`
- `PUT /api/admin/posts/:id`
- `DELETE /api/admin/posts/:id`
- `POST /api/admin/ai-documents`
- `POST /api/admin/ai-documents/:id/index`
- `POST /api/admin/reindex-all`

---

## 12. Estrutura de pastas sugerida

```txt
src/
  app/
    (site)/
      page.tsx
      projects/
        page.tsx
        [slug]/
          page.tsx
      build-notes/
        page.tsx
        [slug]/
          page.tsx
      stack/
        page.tsx
      experiments/
        page.tsx
      how-i-build/
        page.tsx
      playground/
        page.tsx
      contact/
        page.tsx
    admin/
      login/
        page.tsx
      page.tsx
      projects/
        page.tsx
      posts/
        page.tsx
      ai-documents/
        page.tsx
      chat-logs/
        page.tsx
    api/
      chat/
        route.ts
      contact/
        route.ts
      recruiter-summary/
        route.ts
      admin/
        login/
          route.ts
        logout/
          route.ts
        projects/
          route.ts
        posts/
          route.ts
        ai-documents/
          route.ts
  components/
    ui/
    layout/
    home/
    projects/
    blog/
    ai/
    admin/
    animations/
  lib/
    prisma.ts
    redis.ts
    ai/
      provider.ts
      embeddings.ts
      rag.ts
      chunk.ts
      prompts.ts
    auth/
      admin-session.ts
    rate-limit.ts
    utils.ts
  styles/
  config/
prisma/
  schema.prisma
  migrations/
  seed.ts
public/
  images/
  projects/
```

---

## 13. Design system

### Cores

Usar CSS variables.

Sugestão:

```css
--background: #05050a;
--foreground: #f8fafc;
--muted: #9ca3af;
--card: rgba(255, 255, 255, 0.04);
--border: rgba(255, 255, 255, 0.10);
--primary: #8b5cf6;
--primary-foreground: #ffffff;
--secondary: #a855f7;
--accent: #22d3ee;
--danger: #fb7185;
--success: #34d399;
```

### Componentes base

- Button
- Badge
- Card
- SectionHeader
- GradientText
- GlowCard
- AnimatedGridBackground
- NeuralBackground
- ProjectCard
- StackBadge
- ChatBox
- CodeBlock
- Timeline
- BentoGrid
- FeatureCard
- MetricCard

### Layout visual

Usar:

- bento grids;
- cards assimétricos;
- seções com profundidade;
- gradientes suaves;
- highlights de código;
- animações de entrada;
- hover com luz/glow;
- divisores visuais modernos.

---

## 14. Animações

Usar Framer Motion com moderação.

### Animações desejadas

- reveal ao entrar na viewport;
- hover em cards;
- gradiente animado discreto;
- partículas ou grid no hero;
- texto com transição suave;
- chat com animação de mensagem;
- timeline com progress indicator;
- orbit animation em seção de stack;
- cursor glow opcional para desktop.

### Cuidados

- respeitar `prefers-reduced-motion`;
- não comprometer performance;
- evitar animações pesadas em mobile;
- usar CSS quando possível;
- lazy load para elementos decorativos.

---

## 15. Performance

### Requisitos

- Core Web Vitals bons;
- imagens otimizadas;
- evitar JavaScript desnecessário;
- usar Server Components quando possível;
- client components apenas onde há interatividade real;
- lazy load para componentes pesados;
- dynamic import para chat/playgrounds;
- cache de dados públicos;
- metadata bem configurada.

### Estratégias

- `next/image` para imagens;
- fontes locais ou otimizadas;
- componentes server-first;
- suspense boundaries;
- streaming onde fizer sentido;
- Redis cache para respostas comuns;
- paginação no admin;
- indexação eficiente no Postgres.

---

## 16. SEO

### Requisitos

- Metadata por página;
- Open Graph;
- Twitter card;
- sitemap;
- robots.txt;
- schema.org para pessoa, projetos e posts;
- URLs amigáveis;
- blog indexável;
- páginas de projetos indexáveis;
- boa semântica HTML.

### Páginas importantes para SEO

- `/`
- `/projects`
- `/projects/advlink`
- `/projects/zerochat`
- `/build-notes`
- `/stack`
- `/how-i-build`

---

## 17. Docker e deploy fora da Vercel

O projeto precisa funcionar bem em VPS via EasyPanel.

### Dockerfile

Criar Dockerfile multi-stage para produção.

Requisitos:

- instalar dependências;
- gerar Prisma Client;
- rodar build Next.js;
- expor porta 3000;
- start com `npm run start`;
- sem dependência da Vercel.

### docker-compose local

Serviços:

- app
- postgres
- redis

### Exemplo de serviços

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - postgres
      - redis

  postgres:
    image: pgvector/pgvector:pg17
    environment:
      POSTGRES_USER: portfolio
      POSTGRES_PASSWORD: portfolio
      POSTGRES_DB: portfolio
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### EasyPanel

Preparar para:

- usar Dockerfile;
- configurar variáveis de ambiente no painel;
- usar Postgres externo ou container gerenciado;
- usar Redis externo ou container gerenciado;
- apontar domínio via Cloudflare;
- configurar healthcheck se necessário.

---

## 18. Variáveis de ambiente

Criar `.env.example`:

```env
DATABASE_URL="postgresql://portfolio:portfolio@localhost:5433/portfolio"
REDIS_URL="redis://localhost:6379"

APP_URL="http://localhost:3000"
NODE_ENV="development"

ADMIN_PASSWORD="change-me"
SESSION_SECRET="change-me"

AI_PROVIDER="openai"
OPENAI_API_KEY=""
OPENROUTER_API_KEY=""
AI_CHAT_MODEL="gpt-4.1-mini"
AI_EMBEDDING_MODEL="text-embedding-3-small"
AI_EMBEDDING_DIMENSIONS="1536"

CHAT_DAILY_LIMIT="50"
CHAT_MINUTE_LIMIT="10"
```

---

## 19. Seeds iniciais

Criar seed com:

### Projetos

- AdvLink
- ZeroChat
- Tunify
- Gitcatch
- Karmic Reports
- AI Reply System
- ShopFinder

### Tecnologias

- Next.js
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- Node.js
- Prisma
- PostgreSQL
- pgvector
- Redis
- Docker
- EasyPanel
- OpenAI
- OpenRouter
- Stripe
- Resend

### Posts iniciais como rascunho

- Como pensei a arquitetura do AdvLink
- Como eu construiria um chat RAG com pgvector
- Por que VPS + EasyPanel faz sentido para meus projetos

---

## 20. Roadmap de desenvolvimento

## Fase 1 — Fundação

- Criar projeto Next.js
- Configurar TypeScript
- Configurar TailwindCSS
- Configurar shadcn/ui
- Configurar Prisma
- Configurar Postgres com pgvector
- Configurar Redis
- Criar Dockerfile
- Criar docker-compose
- Criar `.env.example`

## Fase 2 — Design System

- Definir tokens de cor
- Criar layout base
- Criar Navbar
- Criar Footer
- Criar componentes de card
- Criar background animado
- Criar SectionHeader
- Criar BentoGrid
- Criar ProjectCard

## Fase 3 — Conteúdo público

- Home
- Projects page
- Project detail page
- Stack page
- How I Build page
- Experiments page
- Build Notes page
- Post detail page

## Fase 4 — Admin

- Login admin
- CRUD de projetos
- CRUD de posts
- CRUD de tecnologias
- CRUD de AI documents
- Upload ou cadastro manual de conteúdo

## Fase 5 — RAG

- Criar serviço de chunking
- Criar serviço de embeddings
- Criar indexação de documentos
- Criar busca por similaridade
- Criar API de chat
- Criar UI de chat
- Criar Project Intelligence

## Fase 6 — Recursos premium

- Recruiter Mode
- Playground
- RAG Visualizer
- Demos interativas
- Feedback no chat
- Logs de perguntas

## Fase 7 — Performance e produção

- SEO
- Sitemap
- Open Graph
- Cache
- Rate limit
- Testes principais
- Docker production build
- Documentação de deploy EasyPanel

---

## 21. Critérios de qualidade

O projeto só deve ser considerado bom quando:

- parecer visualmente premium;
- carregar rápido;
- funcionar bem em mobile;
- demonstrar projetos com profundidade;
- o chat responder com contexto real;
- o admin permitir atualizar conteúdo;
- o deploy não depender da Vercel;
- a estrutura estiver pronta para crescer;
- o código estiver limpo e organizado;
- a experiência passar sensação de produto real.

---

## 22. Prompt inicial para Claude Code

Use este prompt para iniciar o desenvolvimento:

```txt
Você é um engenheiro fullstack senior especializado em Next.js, TypeScript, PostgreSQL, Prisma, Docker, Redis, pgvector, RAG e interfaces modernas.

Vamos construir um portfólio pessoal premium para Alex Santos, desenvolvedor fullstack JavaScript, com estética dark/roxo, moderna, tecnológica e relacionada a IA.

O projeto deve ser feito com Next.js App Router, TypeScript, TailwindCSS, shadcn/ui, Framer Motion, Prisma, PostgreSQL com pgvector, Redis e Docker.

Não será hospedado na Vercel. Ele será hospedado em uma VPS usando EasyPanel, então o projeto precisa ter Dockerfile de produção, docker-compose local, variáveis de ambiente e configuração sem dependências específicas da Vercel.

O site deve incluir:

- home premium;
- AI Portfolio Assistant com RAG;
- projetos em formato de case study;
- Project Intelligence em cada projeto;
- blog/build notes;
- stack page;
- how I build page;
- experiments page;
- recruiter mode;
- playground com demos interativas;
- admin simples para gerenciar conteúdo;
- indexação de documentos com embeddings;
- Redis para rate limit;
- SEO completo;
- design system moderno.

Siga o plano detalhado contido neste documento. Implemente em fases, sempre priorizando arquitetura limpa, performance, responsividade e experiência visual premium.

Antes de começar a codar, gere uma análise da arquitetura, confirme a estrutura de pastas e proponha a ordem de implementação.
```

---

## 23. Observações finais

Este portfólio deve vender Alex como um desenvolvedor que constrói produtos completos, não apenas telas.

A mensagem central do site deve ser:

> Alex Santos é um fullstack developer que transforma ideias em produtos reais usando Next.js, IA, arquitetura moderna e mentalidade de produto.

O site precisa ser tecnicamente sólido, visualmente memorável e útil para recrutadores, clientes e parceiros.
