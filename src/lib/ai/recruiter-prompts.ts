/**
 * Recruiter Mode — canonical role types + LLM prompts.
 *
 * The 6 role types here are FIXED "lenses" through which a recruiter can read
 * Alex's profile. They are NOT the editable `ProfileRoleType` rows from the
 * admin (which describe Alex's own claimed roles and feed the RAG). The two
 * concepts intentionally don't share state.
 */

import type { RagChunk } from "./rag";

export type RecruiterRoleId =
  | "frontend-developer"
  | "fullstack-developer"
  | "product-engineer"
  | "ai-engineer"
  | "saas-builder"
  | "startup-developer";

export const RECRUITER_ROLE_IDS: readonly RecruiterRoleId[] = [
  "frontend-developer",
  "fullstack-developer",
  "product-engineer",
  "ai-engineer",
  "saas-builder",
  "startup-developer",
] as const;

type Locale = "pt-BR" | "en";

/**
 * RAG query string used to retrieve relevant chunks for each role.
 * Mixing Portuguese + English keywords broadens recall across bilingual docs;
 * the locale-aware fallback in `searchSimilarChunks` keeps the response
 * language correct regardless.
 */
const ROLE_QUERIES: Record<RecruiterRoleId, string> = {
  "frontend-developer":
    "frontend React Next.js TypeScript TailwindCSS UI UX design system shadcn animation Framer Motion responsive performance",
  "fullstack-developer":
    "fullstack Next.js TypeScript Node.js Prisma PostgreSQL API Route Handler Server Components frontend backend integração",
  "product-engineer":
    "product engineer produto MVP arquitetura decisões técnicas hipótese discovery business problema solução iteração",
  "ai-engineer":
    "AI IA OpenAI RAG pgvector embeddings LLM chat assistant prompt engineering chunking similarity search",
  "saas-builder":
    "SaaS multi-tenant Stripe billing planos pricing onboarding deploy EasyPanel VPS Docker monetização",
  "startup-developer":
    "startup founder builder MVP scrappy lean shipping iteração rápida produto end-to-end full ownership",
};

export function ragQueryForRole(roleId: RecruiterRoleId): string {
  return ROLE_QUERIES[roleId];
}

/**
 * System prompt for recruiter-mode generation. Instructs the LLM to produce
 * a structured, recruiter-targeted summary in the given locale.
 */
export function recruiterSystemPrompt(opts: {
  roleLabel: string;
  locale: Locale;
}): string {
  const { roleLabel, locale } = opts;

  if (locale === "pt-BR") {
    return `Você é o assistente oficial do portfólio de Alex Santos, gerando um resumo de perfil personalizado para um recrutador que está avaliando Alex para uma vaga de **${roleLabel}**.

Use APENAS o contexto fornecido para escrever. Não invente projetos, empresas ou habilidades que não estejam no contexto.

Estruture a resposta em markdown com exatamente estas seções, nessa ordem:

## Pontos fortes
3 a 5 bullets curtos com as habilidades de Alex mais relevantes para a vaga de ${roleLabel}.

## Projetos relevantes
Liste 2 a 4 projetos do portfólio que melhor demonstram fit com essa vaga. Para cada projeto inclua o nome em **negrito**, uma frase explicando a relevância, e o link interno no formato \`[Ver projeto](/pt-BR/projects/<slug>)\`.

## Stack relacionada
Em 1 ou 2 frases (não bullets), mencione as tecnologias do contexto mais alinhadas à vaga.

## Por que considerar o Alex
1 parágrafo curto e direto resumindo por que ele se encaixa nessa vaga específica. Tom: confiante, profissional, sem exageros.

## Próximo passo
Termine com uma chamada para ação convidando o recrutador a falar com Alex. Inclua o link \`[Entrar em contato](/pt-BR/contact)\`.

Regras:
- Escreva em português do Brasil, claro e direto.
- Se faltar informação para alguma seção, escreva de forma honesta ("o portfólio ainda não detalha isso") em vez de inventar.
- Não use emojis. Não repita o título da vaga em toda seção.
- Tamanho ideal: 280 a 420 palavras no total.`;
  }

  return `You are the official assistant for Alex Santos' portfolio, generating a personalized profile summary for a recruiter who is evaluating Alex for a **${roleLabel}** role.

Use ONLY the provided context. Do not invent projects, companies, or skills not present in the context.

Structure the response in markdown with exactly these sections, in this order:

## Key strengths
3 to 5 short bullets covering Alex's most relevant skills for the ${roleLabel} role.

## Relevant projects
List 2 to 4 portfolio projects that best demonstrate fit. For each: project name in **bold**, one sentence explaining relevance, and an internal link in the format \`[View project](/en/projects/<slug>)\`.

## Related stack
In 1 to 2 sentences (not bullets), mention the technologies from the context most aligned with the role.

## Why consider Alex
One short, direct paragraph summarizing why he fits this specific role. Tone: confident, professional, no hyperbole.

## Next step
End with a call to action inviting the recruiter to reach out. Include the link \`[Get in touch](/en/contact)\`.

Rules:
- Write in clear, direct English.
- If the context lacks information for a section, say so honestly ("the portfolio doesn't detail this yet") instead of fabricating.
- No emojis. Do not repeat the role title in every section.
- Ideal length: 280 to 420 words total.`;
}

/**
 * Convert RAG chunks into a single context block for the system prompt.
 */
export function buildContextBlock(chunks: RagChunk[]): string {
  return chunks
    .map((c, i) => {
      const idx = ((c.metadata.chunkIndex as number) ?? i) + 1;
      return `[${c.documentTitle} — chunk ${idx}]\n${c.content}`;
    })
    .join("\n\n---\n\n");
}
