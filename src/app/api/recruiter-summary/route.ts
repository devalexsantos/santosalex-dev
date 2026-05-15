/**
 * POST /api/recruiter-summary
 *
 * Public route. Generates a recruiter-targeted profile summary for one of the
 * 6 canonical role types (Recruiter Mode — plan section 5.10). Reuses the same
 * RAG infra and rate-limit budget as the chat endpoint.
 *
 * Request body:
 *   { roleId: RecruiterRoleId, locale: "pt-BR" | "en" }
 *
 * Response: SSE stream (text/event-stream)
 *   data: {"chunk":"..."}\n\n
 *   data: {"done":true}\n\n
 *   data: {"error":"..."}\n\n
 */
import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, aiConfig } from "@/lib/ai/provider";
import { searchSimilarChunks } from "@/lib/ai/rag";
import {
  ragQueryForRole,
  recruiterSystemPrompt,
  buildContextBlock,
} from "@/lib/ai/recruiter-prompts";
import type { RecruiterRoleId } from "@/lib/ai/recruiter-prompts";
import { checkChatRateLimits } from "@/lib/rate-limit";
import { recruiterSummaryBodySchema } from "@/lib/validators/recruiter";
import type { RagChunk } from "@/lib/ai/rag";

export const dynamic = "force-dynamic";

const NO_CONTEXT_MSG: Record<string, string> = {
  "pt-BR":
    "O portfólio ainda não tem contexto suficiente para gerar um resumo personalizado para essa vaga. Tente novamente em breve ou explore os projetos diretamente.",
  en: "The portfolio doesn't have enough indexed context yet to generate a personalized summary for this role. Please try again later or browse the projects directly.",
};

/**
 * Role labels used inside the LLM prompt. Kept in this file (not in i18n
 * messages) because they're sent to the model, not rendered in the UI.
 */
const ROLE_LABEL: Record<RecruiterRoleId, { "pt-BR": string; en: string }> = {
  "frontend-developer": {
    "pt-BR": "Frontend Developer",
    en: "Frontend Developer",
  },
  "fullstack-developer": {
    "pt-BR": "Fullstack Developer",
    en: "Fullstack Developer",
  },
  "product-engineer": {
    "pt-BR": "Product Engineer",
    en: "Product Engineer",
  },
  "ai-engineer": {
    "pt-BR": "AI Engineer",
    en: "AI Engineer",
  },
  "saas-builder": {
    "pt-BR": "SaaS Builder",
    en: "SaaS Builder",
  },
  "startup-developer": {
    "pt-BR": "Startup Developer",
    en: "Startup Developer",
  },
};

function extractAndHashIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const real = req.headers.get("x-real-ip");
  const raw = forwarded?.split(",")[0]?.trim() ?? real ?? "127.0.0.1";
  return createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

function sseChunk(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  // 1. Parse + validate
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = recruiterSummaryBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join("; ") },
      { status: 400 },
    );
  }

  const { roleId, locale } = parsed.data as {
    roleId: RecruiterRoleId;
    locale: "pt-BR" | "en";
  };

  // 2. Rate limit — shared budget with /api/chat. Same cost, same throttle.
  const ipHash = extractAndHashIp(req);
  let rateLimitResult;
  try {
    rateLimitResult = await checkChatRateLimits(ipHash);
  } catch (err) {
    console.warn("[recruiter] Rate limit check failed, allowing:", err);
    rateLimitResult = { allowed: true as const };
  }

  if (!rateLimitResult.allowed) {
    const retryAt = rateLimitResult.resetAt.toISOString();
    const errorMsg =
      locale === "pt-BR"
        ? `Você atingiu o limite de uso por ${rateLimitResult.reason === "minute" ? "minuto" : "dia"}. Tente novamente às ${new Date(retryAt).toLocaleTimeString("pt-BR")}.`
        : `You've reached the ${rateLimitResult.reason === "minute" ? "per-minute" : "daily"} usage limit. Try again at ${new Date(retryAt).toLocaleTimeString("en")}.`;
    return NextResponse.json({ error: errorMsg, retryAt }, { status: 429 });
  }

  // 3. RAG search with role-specific query. topK=8 — recruiter summary spans
  // multiple sections (strengths, projects, stack), so wider context helps.
  let chunks: RagChunk[] = [];
  try {
    chunks = await searchSimilarChunks({
      query: ragQueryForRole(roleId),
      locale,
      topK: 8,
      threshold: 0.65,
    });
  } catch (err) {
    console.error("[recruiter] RAG search failed:", err);
    chunks = [];
  }

  // 4. No-context guard
  if (chunks.length === 0) {
    const msg = NO_CONTEXT_MSG[locale] ?? NO_CONTEXT_MSG["en"];
    const stream = new ReadableStream({
      start(controller) {
        const enc = new TextEncoder();
        controller.enqueue(enc.encode(sseChunk({ chunk: msg })));
        controller.enqueue(enc.encode(sseChunk({ done: true })));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // 5. Build prompt
  const roleLabel = ROLE_LABEL[roleId][locale];
  const systemPrompt =
    recruiterSystemPrompt({ roleLabel, locale }) +
    `\n\n---\nCONTEXT:\n${buildContextBlock(chunks)}`;

  // The user-side prompt is implicit (the role selection itself). Sending a
  // brief, locale-aware nudge keeps the chat-completion API happy and reinforces
  // the task framing.
  const userPrompt =
    locale === "pt-BR"
      ? `Gere o resumo do perfil do Alex Santos para uma vaga de ${roleLabel}, seguindo a estrutura exata do system prompt.`
      : `Generate Alex Santos' profile summary for a ${roleLabel} role, following the exact structure from the system prompt.`;

  // 6. Stream LLM response
  let openai;
  try {
    openai = getOpenAI();
  } catch (err) {
    console.error("[recruiter] OpenAI not configured:", err);
    const errorMsg =
      locale === "pt-BR"
        ? "O Recruiter Mode está temporariamente indisponível. Tente novamente mais tarde."
        : "Recruiter Mode is temporarily unavailable. Please try again later.";
    return new Response(
      sseChunk({ error: errorMsg }) + sseChunk({ done: true }),
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      },
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await openai.chat.completions.create({
          model: aiConfig.chatModel,
          stream: true,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.45,
          max_tokens: 1200,
        });

        for await (const part of completion) {
          const delta = part.choices[0]?.delta?.content ?? "";
          if (delta) {
            controller.enqueue(encoder.encode(sseChunk({ chunk: delta })));
          }
        }

        controller.enqueue(encoder.encode(sseChunk({ done: true })));
        controller.close();
      } catch (err) {
        console.error("[recruiter] LLM streaming error:", err);
        const errorMsg =
          locale === "pt-BR"
            ? "Ocorreu um erro ao gerar o resumo. Tente novamente."
            : "An error occurred while generating the summary. Please try again.";
        controller.enqueue(encoder.encode(sseChunk({ error: errorMsg })));
        controller.enqueue(encoder.encode(sseChunk({ done: true })));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
