/**
 * AI translation helpers for pt-BR → English.
 *
 * Design rules:
 * - Single OpenAI chat completion per call (no streaming, no multi-turn).
 * - response_format: { type: "json_object" } to guarantee parseable output.
 * - Empty fields are stripped before sending to avoid wasting tokens.
 * - Returns only the fields that were non-empty in the input; the caller
 *   is responsible for merging them into the full form state.
 * - All errors are rethrown as plain Error with a user-friendly Portuguese
 *   message so forms can display them in a toast.
 */

import { getOpenAI, aiConfig } from "./provider";

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a professional pt-BR → English technical translator for a senior developer portfolio.
Translate Portuguese to natural, idiomatic English.
Keep tone: confident, professional, concise.
Preserve markdown formatting if present.
NEVER translate technical names: Next.js, React, TypeScript, TailwindCSS, Prisma, PostgreSQL, pgvector, Redis, Docker, EasyPanel, OpenAI, OpenRouter, GitHub, Stripe, Resend, n8n, Fastify, Zod, shadcn/ui, Framer Motion, TanStack Query, Cloudflare, Nginx, GitHub Actions.
Return ONLY a JSON object matching the input schema. Every key in the input object must appear in the output, translated to English.`;

// ---------------------------------------------------------------------------
// Project fields
// ---------------------------------------------------------------------------

export type ProjectTranslatableFields = {
  fullDescription?: string;
  problem?: string;
  hypothesis?: string;
  targetAudience?: string;
  technicalDecisions?: string;
  learnings?: string;
  nextSteps?: string;
  architecture?: string;
  challenges?: string;
};

export async function translateProjectFields(
  ptBR: ProjectTranslatableFields
): Promise<ProjectTranslatableFields> {
  // Strip empty fields — don't waste tokens
  const payload: Record<string, string> = {};
  for (const [key, val] of Object.entries(ptBR)) {
    if (val && val.trim()) {
      payload[key] = val.trim();
    }
  }

  if (Object.keys(payload).length === 0) {
    return {};
  }

  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: aiConfig.chatModel,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Translate the following JSON fields from pt-BR to English:\n\n${JSON.stringify(payload, null, 2)}`,
        },
      ],
      temperature: 0.3,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) {
      throw new Error("Resposta vazia da OpenAI.");
    }

    const parsed = JSON.parse(raw) as ProjectTranslatableFields;
    return parsed;
  } catch (err) {
    console.error("[translateProjectFields] error:", err);

    if (err instanceof SyntaxError) {
      throw new Error("A OpenAI retornou um JSON inválido. Tente novamente.");
    }

    if (err instanceof Error) {
      // Surface rate limit or auth errors clearly
      if (err.message.includes("429") || err.message.toLowerCase().includes("rate limit")) {
        throw new Error("Limite de requisições da OpenAI atingido. Aguarde alguns segundos.");
      }
      if (err.message.includes("401") || err.message.toLowerCase().includes("authentication")) {
        throw new Error("Chave da OpenAI inválida. Verifique OPENAI_API_KEY no .env.");
      }
      // Re-throw user-friendly messages we already set above
      if (
        err.message.startsWith("Resposta") ||
        err.message.startsWith("A OpenAI") ||
        err.message.startsWith("Limite") ||
        err.message.startsWith("Chave")
      ) {
        throw err;
      }
    }

    throw new Error("Erro ao traduzir com a OpenAI. Tente novamente.");
  }
}

// ---------------------------------------------------------------------------
// Profile fields
// ---------------------------------------------------------------------------

export type ProfileTranslatableFields = {
  tagline?: string;
  bio?: string;
  approach?: string;
  roles?: Array<{ title: string; description: string }>;
  experiences?: Array<{ role: string; highlights: string }>;
  faqs?: Array<{ question: string; answer: string }>;
};

export async function translateProfileFields(
  ptBR: ProfileTranslatableFields
): Promise<ProfileTranslatableFields> {
  // Build trimmed payload — only include sections with at least one non-empty
  // value. The LLM must echo the same shape back (lists preserve order).
  const payload: ProfileTranslatableFields = {};

  if (ptBR.tagline?.trim())  payload.tagline  = ptBR.tagline.trim();
  if (ptBR.bio?.trim())      payload.bio      = ptBR.bio.trim();
  if (ptBR.approach?.trim()) payload.approach = ptBR.approach.trim();

  if (ptBR.roles && ptBR.roles.length > 0) {
    payload.roles = ptBR.roles.map((r) => ({
      title: (r.title ?? "").trim(),
      description: (r.description ?? "").trim(),
    }));
  }

  if (ptBR.experiences && ptBR.experiences.length > 0) {
    payload.experiences = ptBR.experiences.map((e) => ({
      role: (e.role ?? "").trim(),
      highlights: (e.highlights ?? "").trim(),
    }));
  }

  if (ptBR.faqs && ptBR.faqs.length > 0) {
    payload.faqs = ptBR.faqs.map((f) => ({
      question: (f.question ?? "").trim(),
      answer: (f.answer ?? "").trim(),
    }));
  }

  if (Object.keys(payload).length === 0) {
    return {};
  }

  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: aiConfig.chatModel,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Translate the following JSON fields from pt-BR to English. Arrays MUST be returned in the same order and length:\n\n${JSON.stringify(payload, null, 2)}`,
        },
      ],
      temperature: 0.3,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) {
      throw new Error("Resposta vazia da OpenAI.");
    }

    return JSON.parse(raw) as ProfileTranslatableFields;
  } catch (err) {
    console.error("[translateProfileFields] error:", err);

    if (err instanceof SyntaxError) {
      throw new Error("A OpenAI retornou um JSON inválido. Tente novamente.");
    }

    if (err instanceof Error) {
      if (err.message.includes("429") || err.message.toLowerCase().includes("rate limit")) {
        throw new Error("Limite de requisições da OpenAI atingido. Aguarde alguns segundos.");
      }
      if (err.message.includes("401") || err.message.toLowerCase().includes("authentication")) {
        throw new Error("Chave da OpenAI inválida. Verifique OPENAI_API_KEY no .env.");
      }
      if (
        err.message.startsWith("Resposta") ||
        err.message.startsWith("A OpenAI") ||
        err.message.startsWith("Limite") ||
        err.message.startsWith("Chave")
      ) {
        throw err;
      }
    }

    throw new Error("Erro ao traduzir com a OpenAI. Tente novamente.");
  }
}

// ---------------------------------------------------------------------------
// Post fields
// ---------------------------------------------------------------------------

export type PostTranslatableFields = {
  title: string;
  excerpt: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
};

export async function translatePostFields(
  ptBR: PostTranslatableFields
): Promise<PostTranslatableFields> {
  // Strip empty optional fields
  const payload: Record<string, string> = {
    title: ptBR.title,
    excerpt: ptBR.excerpt,
    content: ptBR.content,
  };
  if (ptBR.seoTitle?.trim()) payload.seoTitle = ptBR.seoTitle.trim();
  if (ptBR.seoDescription?.trim()) payload.seoDescription = ptBR.seoDescription.trim();

  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: aiConfig.chatModel,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Translate the following JSON fields from pt-BR to English:\n\n${JSON.stringify(payload, null, 2)}`,
        },
      ],
      temperature: 0.3,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) {
      throw new Error("Resposta vazia da OpenAI.");
    }

    const parsed = JSON.parse(raw) as PostTranslatableFields;

    // Ensure required fields are present
    if (!parsed.title || !parsed.excerpt || !parsed.content) {
      throw new Error("A OpenAI não retornou todos os campos obrigatórios.");
    }

    return parsed;
  } catch (err) {
    console.error("[translatePostFields] error:", err);

    if (err instanceof SyntaxError) {
      throw new Error("A OpenAI retornou um JSON inválido. Tente novamente.");
    }

    if (err instanceof Error) {
      if (err.message.includes("429") || err.message.toLowerCase().includes("rate limit")) {
        throw new Error("Limite de requisições da OpenAI atingido. Aguarde alguns segundos.");
      }
      if (err.message.includes("401") || err.message.toLowerCase().includes("authentication")) {
        throw new Error("Chave da OpenAI inválida. Verifique OPENAI_API_KEY no .env.");
      }
      if (
        err.message.startsWith("Resposta") ||
        err.message.startsWith("A OpenAI") ||
        err.message.startsWith("Limite") ||
        err.message.startsWith("Chave")
      ) {
        throw err;
      }
    }

    throw new Error("Erro ao traduzir com a OpenAI. Tente novamente.");
  }
}
