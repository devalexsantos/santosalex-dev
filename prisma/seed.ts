import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, TechnologyCategory, ExperienceLevel } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Technologies
// ---------------------------------------------------------------------------

const TECHNOLOGIES = [
  // Frontend
  { slug: "nextjs",          name: "Next.js",         category: TechnologyCategory.frontend,    experienceLevel: ExperienceLevel.advanced },
  { slug: "react",           name: "React",            category: TechnologyCategory.frontend,    experienceLevel: ExperienceLevel.advanced },
  { slug: "typescript",      name: "TypeScript",       category: TechnologyCategory.frontend,    experienceLevel: ExperienceLevel.advanced },
  { slug: "tailwindcss",     name: "TailwindCSS",      category: TechnologyCategory.frontend,    experienceLevel: ExperienceLevel.advanced },
  { slug: "shadcnui",        name: "shadcn/ui",        category: TechnologyCategory.frontend,    experienceLevel: ExperienceLevel.advanced },
  { slug: "framer-motion",   name: "Framer Motion",    category: TechnologyCategory.frontend,    experienceLevel: ExperienceLevel.intermediate },
  { slug: "tanstack-query",  name: "TanStack Query",   category: TechnologyCategory.frontend,    experienceLevel: ExperienceLevel.intermediate },
  // Backend
  { slug: "nodejs",          name: "Node.js",          category: TechnologyCategory.backend,     experienceLevel: ExperienceLevel.advanced },
  { slug: "fastify",         name: "Fastify",          category: TechnologyCategory.backend,     experienceLevel: ExperienceLevel.intermediate },
  { slug: "prisma",          name: "Prisma",           category: TechnologyCategory.backend,     experienceLevel: ExperienceLevel.advanced },
  { slug: "zod",             name: "Zod",              category: TechnologyCategory.backend,     experienceLevel: ExperienceLevel.advanced },
  // Database
  { slug: "postgresql",      name: "PostgreSQL",       category: TechnologyCategory.database,    experienceLevel: ExperienceLevel.intermediate },
  { slug: "pgvector",        name: "pgvector",         category: TechnologyCategory.database,    experienceLevel: ExperienceLevel.intermediate },
  { slug: "redis",           name: "Redis",            category: TechnologyCategory.database,    experienceLevel: ExperienceLevel.intermediate },
  // AI
  { slug: "openai",          name: "OpenAI",           category: TechnologyCategory.ai,          experienceLevel: ExperienceLevel.advanced },
  { slug: "openrouter",      name: "OpenRouter",       category: TechnologyCategory.ai,          experienceLevel: ExperienceLevel.intermediate },
  // DevOps / Infra
  { slug: "docker",          name: "Docker",           category: TechnologyCategory.infra,       experienceLevel: ExperienceLevel.intermediate },
  { slug: "easypanel",       name: "EasyPanel",        category: TechnologyCategory.infra,       experienceLevel: ExperienceLevel.intermediate },
  { slug: "cloudflare",      name: "Cloudflare",       category: TechnologyCategory.infra,       experienceLevel: ExperienceLevel.intermediate },
  { slug: "nginx",           name: "Nginx",            category: TechnologyCategory.infra,       experienceLevel: ExperienceLevel.intermediate },
  { slug: "github-actions",  name: "GitHub Actions",   category: TechnologyCategory.devops,      experienceLevel: ExperienceLevel.intermediate },
  // Automation
  { slug: "n8n",             name: "n8n",              category: TechnologyCategory.automation,  experienceLevel: ExperienceLevel.intermediate },
  // Payments
  { slug: "stripe",          name: "Stripe",           category: TechnologyCategory.payments,    experienceLevel: ExperienceLevel.intermediate },
  // Email
  { slug: "resend",          name: "Resend",           category: TechnologyCategory.email,       experienceLevel: ExperienceLevel.intermediate },
] as const;

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

const PROJECTS = [
  {
    slug: "advlink",
    title: "AdvLink",
    shortDescription: "Site builder multi-tenant para advogados, com SEO local e analytics embutido.",
    category: "saas" as const,
    status: "shipped" as const,
    year: 2024,
    featured: true,
    order: 1,
    content: {
      "pt-BR": {
        problem: "Advogados precisam de presença digital profissional, rapida e acessivel.",
        hypothesis: "Um site builder nichado para advogados converte melhor do que plataformas genericas.",
        targetAudience: "Advogados autonomos e pequenos escritorios no Brasil.",
        technicalDecisions: "Arquitetura multi-tenant, subdominios por usuario, blog separado, SEO local como parte do produto.",
        learnings: "Reducao de friccao no onboarding; importancia de nicho em SaaS; infra com VPS como alternativa a Vercel.",
        nextSteps: "Adicionar analytics por escritorio, onboarding guiado e planos de assinatura com Stripe.",
      },
      en: {
        problem: "Lawyers need a professional, fast and accessible digital presence.",
        hypothesis: "A niche site builder for lawyers converts better than generic platforms.",
        targetAudience: "Solo lawyers and small law firms in Brazil.",
        technicalDecisions: "Multi-tenant architecture, per-user subdomains, separate blog, local SEO as a product feature.",
        learnings: "Lower onboarding friction; importance of niche SaaS; VPS infra as an alternative to Vercel.",
        nextSteps: "Add per-office analytics, guided onboarding and subscription plans with Stripe.",
      },
    },
    techSlugs: ["nextjs", "typescript", "tailwindcss", "prisma", "postgresql", "docker", "easypanel", "cloudflare"],
  },
  {
    slug: "zerochat",
    title: "ZeroChat",
    shortDescription: "Plataforma SaaS de chat em tempo real com suporte a multiplos canais e automacoes inteligentes.",
    category: "saas" as const,
    status: "in_progress" as const,
    year: 2025,
    featured: true,
    order: 2,
    content: {
      "pt-BR": {
        problem: "Empresas perdem leads por nao conseguir centralizar e responder rapidamente em multiplos canais de mensagens.",
        hypothesis: "Uma plataforma unificada com automacoes baseadas em IA pode aumentar a taxa de resposta em ate 3x.",
        targetAudience: "Pequenas e medias empresas que atendem clientes por WhatsApp, Instagram e email simultaneamente.",
        technicalDecisions: "Websockets com Redis para pub/sub em tempo real; filas de tarefas com BullMQ; arquitetura por eventos para alta concorrencia.",
        learnings: "A complexidade de normalizar diferentes plataformas de mensagens e subestimada; abstraccao bem feita vale muito mais do que integracoes diretas.",
        nextSteps: "Integracao com WhatsApp Business API, construcao do sistema de automacoes visuais e modo multi-agente.",
      },
      en: {
        problem: "Businesses lose leads by failing to centralize and respond quickly across multiple messaging channels.",
        hypothesis: "A unified platform with AI-driven automations can increase response rate by up to 3x.",
        targetAudience: "Small and medium businesses handling customers on WhatsApp, Instagram and email simultaneously.",
        technicalDecisions: "Websockets with Redis pub/sub for real-time; BullMQ task queues; event-driven architecture for high concurrency.",
        learnings: "The complexity of normalizing different messaging platforms is underestimated; a good abstraction layer is far more valuable than direct integrations.",
        nextSteps: "WhatsApp Business API integration, visual automation builder and multi-agent mode.",
      },
    },
    techSlugs: ["nextjs", "nodejs", "typescript", "redis", "postgresql", "prisma", "tailwindcss", "openai"],
  },
  {
    slug: "tunify",
    title: "Tunify",
    shortDescription: "Ferramenta de IA que analisa o estilo musical do usuario e gera playlists personalizadas com recomendacoes contextuais.",
    category: "ai" as const,
    status: "shipped" as const,
    year: 2024,
    featured: true,
    order: 3,
    content: {
      "pt-BR": {
        problem: "Plataformas de streaming recomendam musicas populares globalmente, nao o que o usuario realmente quer ouvir naquele momento.",
        hypothesis: "Combinar embeddings de audio com contexto de humor e atividade gera playlists mais relevantes do que algoritmos de popularidade.",
        targetAudience: "Ouvintes ativos de musica que buscam descoberta musical mais personalizada e contextual.",
        technicalDecisions: "Pipeline RAG para combinar perfil do usuario com catalogo musical; embeddings via OpenAI; armazenamento vetorial com pgvector.",
        learnings: "O contexto de atividade (correr, estudar, trabalhar) impacta mais a satisfacao do que preferencias genericas de genero.",
        nextSteps: "Integracao direta com Spotify API para sincronizar playlists geradas automaticamente.",
      },
      en: {
        problem: "Streaming platforms recommend globally popular music, not what the user actually wants to hear at a given moment.",
        hypothesis: "Combining audio embeddings with mood and activity context generates more relevant playlists than popularity algorithms.",
        targetAudience: "Active music listeners seeking more personalized and contextual music discovery.",
        technicalDecisions: "RAG pipeline to combine user profile with music catalog; embeddings via OpenAI; vector storage with pgvector.",
        learnings: "Activity context (running, studying, working) impacts satisfaction more than generic genre preferences.",
        nextSteps: "Direct Spotify API integration to sync auto-generated playlists.",
      },
    },
    techSlugs: ["nextjs", "typescript", "openai", "pgvector", "postgresql", "tailwindcss", "shadcnui"],
  },
  {
    slug: "gitcatch",
    title: "Gitcatch",
    shortDescription: "Automacao que monitora repositorios GitHub e envia alertas inteligentes baseados em padroes de commit e atividade da equipe.",
    category: "automation" as const,
    status: "shipped" as const,
    year: 2024,
    featured: false,
    order: 4,
    content: {
      "pt-BR": {
        problem: "Times de desenvolvimento perdem visibilidade sobre atividade do repositorio e padroes que indicam debito tecnico crescente.",
        hypothesis: "Alertas automaticos contextuais por Slack ou email podem melhorar a cultura de code review sem adicionar carga manual.",
        targetAudience: "Times de desenvolvimento de 3 a 15 pessoas que usam GitHub como plataforma principal.",
        technicalDecisions: "GitHub Webhooks para capturar eventos em tempo real; n8n para orquestrar automacoes; analise de padroes com LLM para gerar summaries.",
        learnings: "A maioria dos times quer informacao condensada, nao mais notificacoes; a IA no summarization foi o diferencial que gerou engajamento real.",
        nextSteps: "Dashboard de saude do repositorio com metricas de ciclo de review e tempo medio de merge.",
      },
      en: {
        problem: "Development teams lose visibility into repository activity and patterns that indicate growing technical debt.",
        hypothesis: "Contextual automatic alerts via Slack or email can improve code review culture without adding manual overhead.",
        targetAudience: "Development teams of 3 to 15 people using GitHub as their main platform.",
        technicalDecisions: "GitHub Webhooks for real-time event capture; n8n to orchestrate automations; LLM-based pattern analysis for summaries.",
        learnings: "Most teams want condensed information, not more notifications; AI summarization was the differentiator that drove real engagement.",
        nextSteps: "Repository health dashboard with review cycle metrics and average merge time.",
      },
    },
    techSlugs: ["nodejs", "typescript", "n8n", "openai", "resend", "postgresql"],
  },
  {
    slug: "karmic-reports",
    title: "Karmic Reports",
    shortDescription: "Gerador de relatorios numerologicos personalizados com IA, entregues por email em PDF com identidade visual premium.",
    category: "ai" as const,
    status: "shipped" as const,
    year: 2024,
    featured: false,
    order: 5,
    content: {
      "pt-BR": {
        problem: "Consultas numerologicas sao caras, demoradas e dificeis de escalar — a demanda existe, mas a oferta e artesanal.",
        hypothesis: "Um produto digital que gera relatorios de alta qualidade com IA e entrega automaticamente pode capturar essa demanda com margem alta.",
        targetAudience: "Pessoas interessadas em autoconhecimento, espiritualidade e numerologia que buscam experiencias digitais premium.",
        technicalDecisions: "Prompt engineering estruturado para gerar conteudo coerente; geracao de PDF server-side com layout customizado; Stripe para pagamentos one-time.",
        learnings: "O posicionamento premium (preco, design, entrega) importa mais que o conteudo em si para esse mercado; copy e apresentacao sao o produto.",
        nextSteps: "Internacionalizacao para mercado hispanohablante e sistema de afiliados para escalar distribuicao.",
      },
      en: {
        problem: "Numerological consultations are expensive, slow and hard to scale — demand exists but supply is artisanal.",
        hypothesis: "A digital product that generates high-quality AI reports and delivers them automatically can capture this demand at high margins.",
        targetAudience: "People interested in self-knowledge, spirituality and numerology seeking premium digital experiences.",
        technicalDecisions: "Structured prompt engineering for coherent content; server-side PDF generation with custom layout; Stripe for one-time payments.",
        learnings: "Premium positioning (price, design, delivery) matters more than the content itself in this market; copy and presentation are the product.",
        nextSteps: "Internationalization for the Spanish-speaking market and affiliate system for scaled distribution.",
      },
    },
    techSlugs: ["nextjs", "typescript", "openai", "stripe", "resend", "tailwindcss"],
  },
  {
    slug: "ai-reply-system",
    title: "AI Reply System",
    shortDescription: "Sistema experimental de respostas automaticas inteligentes para Reddit marketing com controle de tom e contexto.",
    category: "experiment" as const,
    status: "in_progress" as const,
    year: 2025,
    featured: false,
    order: 6,
    content: {
      "pt-BR": {
        problem: "Marketing organico no Reddit exige respostas rapidas, contextuais e que nao soem como spam — tarefa impossivel de fazer manualmente em escala.",
        hypothesis: "Um sistema que analisa o contexto do post, perfil do subreddit e historico da conversa pode gerar respostas que passam como humanas e geram tracao.",
        targetAudience: "Founders e equipes de growth que usam Reddit como canal de aquisicao organica.",
        technicalDecisions: "Pipeline de analise de contexto com RAG; multiplos modelos via OpenRouter para otimizar custo/qualidade; fila de aprovacao humana antes do envio.",
        learnings: "O passo de aprovacao humana e essencial — sem ele o sistema degrada em spam; o valor esta na sugestao, nao na automacao total.",
        nextSteps: "Dashboard de analytics por subreddit, aprendizado por feedback e integracao com outras plataformas como HackerNews.",
      },
      en: {
        problem: "Organic marketing on Reddit requires fast, contextual replies that don't sound like spam — impossible to do manually at scale.",
        hypothesis: "A system that analyzes post context, subreddit profile and conversation history can generate human-passing replies that drive traction.",
        targetAudience: "Founders and growth teams using Reddit as an organic acquisition channel.",
        technicalDecisions: "Context analysis pipeline with RAG; multiple models via OpenRouter to optimize cost/quality; human approval queue before sending.",
        learnings: "The human approval step is essential — without it the system degrades into spam; the value is in suggestion, not full automation.",
        nextSteps: "Per-subreddit analytics dashboard, feedback-driven learning and integration with other platforms like HackerNews.",
      },
    },
    techSlugs: ["nodejs", "typescript", "openai", "openrouter", "n8n", "redis", "postgresql"],
  },
  {
    slug: "shopfinder",
    title: "ShopFinder",
    shortDescription: "Marketplace local para descoberta de lojas fisicas e produtos com busca geoespacial e recomendacoes personalizadas.",
    category: "saas" as const,
    status: "archived" as const,
    year: 2023,
    featured: false,
    order: 7,
    content: {
      "pt-BR": {
        problem: "Consumidores tem dificuldade de descobrir lojas locais e produtos disponiveis proximos a eles, caindo sempre nos mesmos marketplaces nacionais.",
        hypothesis: "Um app focado em descoberta local com busca geoespacial pode ativar o comercio de bairro que nao tem presenca digital adequada.",
        targetAudience: "Consumidores urbanos de 20-40 anos que valorizam comprar local e lojistas sem estrutura para marketplaces grandes.",
        technicalDecisions: "PostgreSQL com extensao PostGIS para busca geoespacial; PWA para evitar barreiras de app store; onboarding simplificado para lojistas.",
        learnings: "O lado lojista era o gargalo real — sem oferta densa, a demanda nao se ativa; pivotei para ZeroChat apos validar que o problema era de comunicacao, nao de descoberta.",
        nextSteps: "Projeto arquivado apos pivot. Aprendizados aplicados na construcao do ZeroChat.",
      },
      en: {
        problem: "Consumers struggle to discover local stores and nearby available products, always falling back on national marketplaces.",
        hypothesis: "A local discovery app with geospatial search can activate neighborhood commerce that lacks proper digital presence.",
        targetAudience: "Urban consumers aged 20-40 who value buying local, and merchants without structure for large marketplaces.",
        technicalDecisions: "PostgreSQL with PostGIS extension for geospatial search; PWA to avoid app store friction; simplified merchant onboarding.",
        learnings: "The merchant side was the real bottleneck — without dense supply, demand doesn't activate; pivoted to ZeroChat after validating the problem was communication, not discovery.",
        nextSteps: "Project archived after pivot. Learnings applied to building ZeroChat.",
      },
    },
    techSlugs: ["nextjs", "typescript", "postgresql", "prisma", "tailwindcss", "cloudflare"],
  },
  {
    slug: "ai-video-cuts",
    title: "AI Video Cuts",
    shortDescription: "Ferramenta experimental que transcreve videos longos e identifica automaticamente os melhores cortes para Reels e Shorts.",
    category: "experiment" as const,
    status: "in_progress" as const,
    year: 2025,
    featured: false,
    order: 8,
    content: {
      "pt-BR": {
        problem: "Criadores de conteudo gastam horas editando videos longos para extrair cortes curtos — processo manual, repetitivo e caro para terceirizar.",
        hypothesis: "Whisper para transcricao + LLM para identificacao de momentos de alto engajamento pode automatizar 80% do trabalho de selecao de cortes.",
        targetAudience: "Criadores de conteudo, podcasters e empresas que produzem video longo e precisam distribuir em formatos curtos.",
        technicalDecisions: "OpenAI Whisper para transcricao; analise semantica dos trechos com GPT-4; ffmpeg para corte automatizado; preview em tempo real no browser.",
        learnings: "A identificacao de momento viral e subjetiva demais para automatizar totalmente; o melhor fluxo e sugerir cortes ranqueados e deixar a decisao final com o criador.",
        nextSteps: "Interface de revisao de cortes sugeridos com preview inline e exportacao direta para formatos de Reels/Shorts.",
      },
      en: {
        problem: "Content creators spend hours editing long videos to extract short clips — a manual, repetitive and expensive process to outsource.",
        hypothesis: "Whisper for transcription + LLM for high-engagement moment detection can automate 80% of clip selection work.",
        targetAudience: "Content creators, podcasters and companies producing long-form video that need to distribute in short formats.",
        technicalDecisions: "OpenAI Whisper for transcription; GPT-4 semantic analysis of segments; ffmpeg for automated cutting; real-time browser preview.",
        learnings: "Identifying a viral moment is too subjective to fully automate; the best flow is to suggest ranked cuts and leave the final decision to the creator.",
        nextSteps: "Suggested cut review UI with inline preview and direct export to Reels/Shorts formats.",
      },
    },
    techSlugs: ["nodejs", "typescript", "openai", "fastify", "redis", "tailwindcss"],
  },
] as const;

// ---------------------------------------------------------------------------
// Post content helpers — extracted to avoid template-literal nesting issues
// ---------------------------------------------------------------------------

function advlinkContentPtBR(): string {
  return [
    "# Como pensei a arquitetura do AdvLink",
    "",
    "## O problema original",
    "",
    "Quando comecei a construir o AdvLink, o desafio nao era apenas tecnico — era entender o que um advogado realmente precisava para ter presenca digital sem gastar fortunas em agencias ou perder horas configurando WordPress.",
    "",
    "A maioria das solucoes existentes eram genericas demais. Um advogado nao quer um site de empresa — ele quer credibilidade, aparencia local e um jeito de ser encontrado no Google por clientes potenciais da sua cidade.",
    "",
    "## A decisao por multi-tenancy",
    "",
    "A primeira grande decisao foi: um site por advogado ou um sistema compartilhado? Optei pela arquitetura multi-tenant com subdominios dinamicos por algumas razoes:",
    "",
    "1. **Custo de infra**: um unico servidor serve todos os clientes",
    "2. **Deploy centralizado**: atualizo o produto uma vez, todos ganham",
    "3. **Identidade separada**: cada subdominio parece um site independente para o Google e para o cliente",
    "",
    "A implementacao usa o middleware do Next.js para detectar o subdominio e carregar o tema e dados do advogado correspondente. O hostname da requisicao e parseado e mapeado para um tenantId no banco.",
    "",
    "## Subdominios em producao",
    "",
    "Configurar subdominios dinamicos sem Vercel foi o maior desafio. A solucao foi:",
    "",
    "- **Cloudflare** com wildcard DNS (*.advlink.com.br)",
    "- **Nginx** como reverse proxy, passando o Host original para o Next.js",
    "- **EasyPanel** para orquestrar os containers",
    "",
    "O Next.js nunca sabe que esta servindo multiplos dominios — ele apenas recebe o header host e serve o conteudo certo via middleware.",
    "",
    "## SEO local como feature de produto",
    "",
    "Um insight importante: para advogados, SEO local e mais valioso que qualquer outra feature. Um advogado que aparece no Google quando alguem pesquisa 'advogado trabalhista em Campinas' tem um ativo real.",
    "",
    "Isso influenciou diretamente a arquitetura:",
    "",
    "- Cada pagina e um Server Component para garantir SSR completo",
    "- Metadata dinamica gerada por subdominio com cidade, especialidade e nome do advogado",
    "- Schema.org com LocalBusiness e LegalService embutidos",
    "- Sitemap gerado programaticamente por tenant",
    "",
    "## O que aprendi",
    "",
    "A principal licao foi sobre onboarding. Qualquer friccao no cadastro = churn imediato. O fluxo inicial levava 12 passos — reduzi para 3 e a taxa de conclusao triplicou.",
    "",
    "Outra licao: VPS com EasyPanel e perfeitamente capaz de servir um SaaS com multiplos tenants. Sem custo de Vercel, sem lock-in, com controle total sobre a infra.",
  ].join("\n");
}

function advlinkContentEn(): string {
  return [
    "# How I architected AdvLink",
    "",
    "## The original problem",
    "",
    "When I started building AdvLink, the challenge wasn't just technical — it was understanding what a lawyer actually needed to have a digital presence without spending a fortune on agencies or wasting hours setting up WordPress.",
    "",
    "Most existing solutions were too generic. A lawyer doesn't want a 'company' website — they want credibility, a local feel and a way to be found on Google by potential clients in their city.",
    "",
    "## The multi-tenancy decision",
    "",
    "The first big decision was: one site per lawyer or a shared system? I chose the multi-tenant architecture with dynamic subdomains for a few reasons:",
    "",
    "1. **Infrastructure cost**: a single server serves all clients",
    "2. **Centralized deployment**: I update the product once, everyone benefits",
    "3. **Separate identity**: each subdomain looks like an independent site to Google and the client",
    "",
    "The implementation uses Next.js middleware to detect the subdomain and load the corresponding lawyer's theme and data. The request hostname is parsed and mapped to a tenantId in the database.",
    "",
    "## Dynamic subdomains in production",
    "",
    "Configuring dynamic subdomains without Vercel was the biggest challenge. The solution was:",
    "",
    "- **Cloudflare** with wildcard DNS (*.advlink.com.br)",
    "- **Nginx** as a reverse proxy, passing the original Host header to Next.js",
    "- **EasyPanel** to orchestrate the containers",
    "",
    "Next.js never knows it's serving multiple domains — it simply receives the host header and serves the right content via middleware.",
    "",
    "## Local SEO as a product feature",
    "",
    "An important insight: for lawyers, local SEO is more valuable than any other feature. A lawyer who appears on Google when someone searches 'employment lawyer in Campinas' has a real asset.",
    "",
    "This directly influenced the architecture:",
    "",
    "- Every page is a Server Component for guaranteed full SSR",
    "- Dynamic metadata generated per subdomain with city, specialty and lawyer name",
    "- Schema.org with LocalBusiness and LegalService embedded",
    "- Sitemap generated programmatically per tenant",
    "",
    "## What I learned",
    "",
    "The main lesson was about onboarding. Any friction in signup = immediate churn. The initial flow took 12 steps — I reduced it to 3 and the completion rate tripled.",
    "",
    "Another lesson: VPS with EasyPanel is perfectly capable of serving a multi-tenant SaaS. No Vercel cost, no lock-in, with full control over the infrastructure.",
  ].join("\n");
}

function vpsContentPtBR(): string {
  return [
    "# Por que VPS + EasyPanel faz sentido para meus projetos",
    "",
    "## O ponto de partida",
    "",
    "Por muito tempo usei a Vercel como plataforma padrao de deploy. E conveniente, rapida e funciona muito bem para projetos simples. Mas conforme meus projetos cresceram em complexidade — multi-tenant, Redis, workers, websockets — os limites e o custo da Vercel comecaram a pesar.",
    "",
    "## O problema com Vercel para aplicacoes complexas",
    "",
    "A Vercel e otimizada para um caso de uso especifico: aplicacoes stateless, serverless, sem estado persistente. Quando voce precisa de:",
    "",
    "- **Redis** rodando na mesma rede privada",
    "- **Websockets** de longa duracao",
    "- **Workers** rodando em background",
    "- **Multiplos containers** se comunicando",
    "- **Custo previsivel** em vez de por-request",
    "",
    "...a Vercel deixa de ser a ferramenta certa.",
    "",
    "## Por que EasyPanel",
    "",
    "EasyPanel e uma plataforma de self-hosting que funciona como uma abstracao sobre Docker e Nginx. Voce tem:",
    "",
    "- Interface web para gerenciar servicos",
    "- Deploy automatico via GitHub",
    "- SSL automatico com Let's Encrypt",
    "- Configuracao de dominios e subdominios com clique",
    "- Suporte nativo a Docker Compose",
    "",
    "E basicamente o que a Vercel oferece, mas rodando no seu proprio servidor, com custo fixo.",
    "",
    "## A stack de infra que uso",
    "",
    "Um VPS de 4 vCPU / 8GB RAM custa ~$24/mes e aguenta facilmente:",
    "",
    "- 3 a 5 aplicacoes Next.js em producao",
    "- 1 instancia de PostgreSQL",
    "- 1 instancia de Redis",
    "- Nginx como reverse proxy",
    "- Certbot para SSL",
    "",
    "Para a maioria dos meus projetos, esse VPS custa menos do que um unico projeto na Vercel Pro com volume real de trafego.",
    "",
    "## O que eu abri mao",
    "",
    "Nao e de graca. Voce ganha controle e perde conveniencia:",
    "",
    "- Precisa gerenciar atualizacoes de seguranca do SO",
    "- Monitorar uso de disco e memoria",
    "- Configurar backups do banco de dados",
    "- Lidar com problemas de rede ocasionais",
    "",
    "Para um desenvolvedor solo construindo produtos reais, o trade-off vale a pena. O aprendizado operacional e valioso e o custo e incomparavelmente menor.",
    "",
    "## Conclusao",
    "",
    "Se voce esta construindo MVPs, SaaS com banco de dados e Redis, ou qualquer coisa que precise de controle sobre a infra — VPS + EasyPanel e uma opcao seria. Nao e mais complicado do que parece, e a autonomia que voce ganha e enorme.",
  ].join("\n");
}

function vpsContentEn(): string {
  return [
    "# Why VPS + EasyPanel makes sense for my projects",
    "",
    "## The starting point",
    "",
    "For a long time I used Vercel as my default deployment platform. It's convenient, fast and works great for simple projects. But as my projects grew in complexity — multi-tenant, Redis, workers, websockets — Vercel's limits and cost started to hurt.",
    "",
    "## The problem with Vercel for complex applications",
    "",
    "Vercel is optimized for a specific use case: stateless, serverless applications with no persistent state. When you need:",
    "",
    "- **Redis** running on the same private network",
    "- **Long-lived websockets**",
    "- **Background workers**",
    "- **Multiple containers** communicating with each other",
    "- **Predictable cost** instead of per-request pricing",
    "",
    "...Vercel stops being the right tool.",
    "",
    "## Why EasyPanel",
    "",
    "EasyPanel is a self-hosting platform that works as an abstraction over Docker and Nginx. You get:",
    "",
    "- A web interface to manage services",
    "- Automatic deployment via GitHub",
    "- Automatic SSL with Let's Encrypt",
    "- One-click domain and subdomain configuration",
    "- Native Docker Compose support",
    "",
    "It's essentially what Vercel offers, but running on your own server, at a fixed cost.",
    "",
    "## The infra stack I use",
    "",
    "A 4 vCPU / 8GB RAM VPS costs ~$24/month and easily handles:",
    "",
    "- 3 to 5 Next.js applications in production",
    "- 1 PostgreSQL instance",
    "- 1 Redis instance",
    "- Nginx as reverse proxy",
    "- Certbot for SSL",
    "",
    "For most of my projects, that VPS costs less than a single project on Vercel Pro with real traffic volume.",
    "",
    "## What I gave up",
    "",
    "It's not free. You gain control and lose convenience:",
    "",
    "- You need to manage OS security updates",
    "- Monitor disk and memory usage",
    "- Configure database backups",
    "- Deal with occasional network issues",
    "",
    "For a solo developer building real products, the trade-off is worth it. The operational learning is valuable and the cost is incomparably lower.",
    "",
    "## Conclusion",
    "",
    "If you're building MVPs, SaaS with a database and Redis, or anything that needs infra control — VPS + EasyPanel is a serious option. It's not as complicated as it sounds, and the autonomy you gain is enormous.",
  ].join("\n");
}

function ragContentPtBR(): string {
  return [
    "# Como construiria um chat RAG com pgvector",
    "",
    "## O que e RAG e por que importa",
    "",
    "RAG (Retrieval-Augmented Generation) e a tecnica que permite que modelos de linguagem respondam com base em conteudo especifico — nao apenas no que aprenderam durante o treinamento.",
    "",
    "Em vez de perguntar ao modelo 'o que voce sabe sobre X?', voce pergunta 'dado este contexto especifico, responda sobre X'. A diferenca e enorme em termos de precisao e confiabilidade.",
    "",
    "## A arquitetura que eu usaria",
    "",
    "### 1. Indexacao de documentos",
    "",
    "Cada conteudo do sistema (projetos, posts, perfil, FAQs) passa por um pipeline de indexacao:",
    "",
    "Conteudo -> Chunking -> Embedding -> pgvector",
    "",
    "O chunking divide o conteudo em pedacos de ~500 tokens com overlap de ~100 tokens para preservar contexto entre chunks adjacentes.",
    "",
    "O embedding e gerado via text-embedding-3-small da OpenAI (1536 dimensoes, custo muito baixo) e armazenado como vector(1536) no Postgres via extensao pgvector.",
    "",
    "### 2. Pipeline de busca",
    "",
    "Quando uma pergunta chega:",
    "",
    "1. Gerar embedding da pergunta",
    "2. Buscar os N chunks mais similares usando distancia cosseno no pgvector",
    "3. Filtrar por threshold minimo de similaridade (~0.7)",
    "4. Montar contexto concatenando os chunks relevantes",
    "",
    "### 3. Geracao de resposta",
    "",
    "O contexto recuperado e injetado no system prompt junto com a pergunta do usuario. O modelo responde apenas com base nesse contexto.",
    "",
    "## Por que Postgres em vez de um vector database dedicado",
    "",
    "Manter tudo no Postgres tem vantagens praticas:",
    "",
    "- **Uma infra so**: sem Pinecone, Weaviate ou Chroma para gerenciar",
    "- **Joins poderosos**: posso filtrar por categoria, locale, data de publicacao",
    "- **Transacoes ACID**: indexacao e conteudo ficam sempre consistentes",
    "- **Custo zero adicional**: ja pago pelo Postgres",
    "",
    "Para volumes ate ~1 milhao de chunks, o pgvector com indice HNSW performa muito bem.",
    "",
    "## Consideracoes de producao",
    "",
    "- **Rate limiting** com Redis e essencial para evitar abuso e custo inesperado",
    "- **Caching** de embeddings frequentes reduz custo de API",
    "- **Fallback de idioma**: se nao ha chunks suficientes em ingles, busca em portugues",
    "- **Feedback loop**: coletar ratings das respostas para identificar gaps de conteudo",
    "",
    "Este e exatamente o sistema que roda no AI Portfolio Assistant deste site.",
  ].join("\n");
}

function ragContentEn(): string {
  return [
    "# How I'd build a RAG chat with pgvector",
    "",
    "## What RAG is and why it matters",
    "",
    "RAG (Retrieval-Augmented Generation) is the technique that allows language models to respond based on specific content — not just what they learned during training.",
    "",
    "Instead of asking the model 'what do you know about X?', you ask 'given this specific context, answer about X'. The difference is enormous in terms of accuracy and reliability.",
    "",
    "## The architecture I would use",
    "",
    "### 1. Document indexing",
    "",
    "Every piece of content in the system (projects, posts, profile, FAQs) goes through an indexing pipeline:",
    "",
    "Content -> Chunking -> Embedding -> pgvector",
    "",
    "Chunking splits the content into ~500-token pieces with ~100-token overlap to preserve context between adjacent chunks.",
    "",
    "The embedding is generated via OpenAI's text-embedding-3-small (1536 dimensions, very low cost) and stored as vector(1536) in Postgres via the pgvector extension.",
    "",
    "### 2. Search pipeline",
    "",
    "When a question arrives:",
    "",
    "1. Generate embedding for the question",
    "2. Search for the N most similar chunks using cosine distance in pgvector",
    "3. Filter by minimum similarity threshold (~0.7)",
    "4. Build context by concatenating the relevant chunks",
    "",
    "### 3. Response generation",
    "",
    "The retrieved context is injected into the system prompt along with the user's question. The model responds only based on that context.",
    "",
    "## Why Postgres instead of a dedicated vector database",
    "",
    "Keeping everything in Postgres has practical advantages:",
    "",
    "- **Single infrastructure**: no Pinecone, Weaviate or Chroma to manage",
    "- **Powerful joins**: I can filter by category, locale, publication date",
    "- **ACID transactions**: indexing and content always stay consistent",
    "- **Zero additional cost**: I already pay for Postgres",
    "",
    "For volumes up to ~1 million chunks, pgvector with an HNSW index performs very well.",
    "",
    "## Production considerations",
    "",
    "- **Rate limiting** with Redis is essential to prevent abuse and unexpected costs",
    "- **Caching** frequent embeddings reduces API cost",
    "- **Language fallback**: if there aren't enough chunks in English, search in Portuguese",
    "- **Feedback loop**: collect response ratings to identify content gaps",
    "",
    "This is exactly the system running in the AI Portfolio Assistant on this site.",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

const POSTS = [
  {
    translationGroupId: "advlink-architecture",
    category: "architecture" as const,
    published: true,
    publishedAt: new Date("2025-01-20"),
    readingTime: 8,
    versions: {
      "pt-BR": {
        slug: "como-pensei-a-arquitetura-do-advlink",
        title: "Como pensei a arquitetura do AdvLink",
        excerpt: "Uma analise detalhada das decisoes de arquitetura por tras do AdvLink: multi-tenancy, subdominios dinamicos, SEO local e deploy sem Vercel.",
        tags: ["arquitetura", "saas", "multi-tenant", "nextjs", "deploy"],
        content: advlinkContentPtBR(),
      },
      en: {
        slug: "how-i-architected-advlink",
        title: "How I architected AdvLink",
        excerpt: "A detailed analysis of the architecture decisions behind AdvLink: multi-tenancy, dynamic subdomains, local SEO and Vercel-free deployment.",
        tags: ["architecture", "saas", "multi-tenant", "nextjs", "deploy"],
        content: advlinkContentEn(),
      },
    },
  },
  {
    translationGroupId: "vps-easypanel",
    category: "infra" as const,
    published: true,
    publishedAt: new Date("2025-02-10"),
    readingTime: 6,
    versions: {
      "pt-BR": {
        slug: "por-que-vps-easypanel-faz-sentido",
        title: "Por que VPS + EasyPanel faz sentido para meus projetos",
        excerpt: "Comparacao honesta entre deploy na Vercel e VPS autogerenciado com EasyPanel. Por que escolhi o caminho mais trabalhoso — e nao me arrependo.",
        tags: ["infra", "deploy", "vps", "easypanel", "devops"],
        content: vpsContentPtBR(),
      },
      en: {
        slug: "why-vps-easypanel-makes-sense",
        title: "Why VPS + EasyPanel makes sense for my projects",
        excerpt: "An honest comparison between Vercel deployment and self-managed VPS with EasyPanel. Why I chose the harder path — and have no regrets.",
        tags: ["infra", "deploy", "vps", "easypanel", "devops"],
        content: vpsContentEn(),
      },
    },
  },
  {
    translationGroupId: "rag-chat-pgvector",
    category: "ai" as const,
    published: false,
    publishedAt: null,
    readingTime: 10,
    versions: {
      "pt-BR": {
        slug: "como-construiria-um-chat-rag-com-pgvector",
        title: "Como construiria um chat RAG com pgvector",
        excerpt: "Um guia arquitetural completo para construir um assistente de IA contextual usando Next.js, Postgres, pgvector e OpenAI — do zero ao deploy.",
        tags: ["ia", "rag", "pgvector", "nextjs", "openai"],
        content: ragContentPtBR(),
      },
      en: {
        slug: "how-id-build-a-rag-chat-with-pgvector",
        title: "How I'd build a RAG chat with pgvector",
        excerpt: "A complete architectural guide to building a contextual AI assistant using Next.js, Postgres, pgvector and OpenAI — from scratch to deployment.",
        tags: ["ai", "rag", "pgvector", "nextjs", "openai"],
        content: ragContentEn(),
      },
    },
  },
] as const;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Starting seed...");

  // ── Technologies ────────────────────────────────────────────────────────
  console.log("Upserting technologies...");
  for (const t of TECHNOLOGIES) {
    await prisma.technology.upsert({
      where: { slug: t.slug },
      update: { name: t.name, category: t.category, experienceLevel: t.experienceLevel },
      create: t,
    });
  }
  console.log("  " + TECHNOLOGIES.length + " technologies upserted");

  // ── Projects ─────────────────────────────────────────────────────────────
  console.log("Upserting projects...");
  for (const p of PROJECTS) {
    const { techSlugs, ...projectData } = p;

    const project = await prisma.project.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        shortDescription: p.shortDescription,
        category: p.category,
        status: p.status,
        year: p.year,
        featured: p.featured,
        order: p.order,
        content: p.content,
      },
      create: projectData,
    });

    // Upsert ProjectStack entries
    for (const techSlug of techSlugs) {
      const technology = await prisma.technology.findUnique({ where: { slug: techSlug } });
      if (!technology) continue;

      await prisma.projectStack.upsert({
        where: { projectId_technologyId: { projectId: project.id, technologyId: technology.id } },
        update: {},
        create: { projectId: project.id, technologyId: technology.id },
      });
    }
  }
  console.log("  " + PROJECTS.length + " projects upserted");

  // ── Posts ─────────────────────────────────────────────────────────────────
  console.log("Upserting posts...");
  for (const post of POSTS) {
    for (const [locale, version] of Object.entries(post.versions)) {
      await prisma.post.upsert({
        where: { locale_slug: { locale, slug: version.slug } },
        update: {
          title: version.title,
          excerpt: version.excerpt,
          content: version.content,
          tags: version.tags as string[],
          category: post.category,
          published: post.published,
          publishedAt: post.publishedAt,
          readingTime: post.readingTime,
          translationGroupId: post.translationGroupId,
        },
        create: {
          slug: version.slug,
          locale,
          translationGroupId: post.translationGroupId,
          title: version.title,
          excerpt: version.excerpt,
          content: version.content,
          tags: version.tags as string[],
          category: post.category,
          published: post.published,
          publishedAt: post.publishedAt,
          readingTime: post.readingTime,
        },
      });
    }
  }
  console.log("  " + (POSTS.length * 2) + " post records upserted (" + POSTS.length + " posts x 2 locales)");

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
