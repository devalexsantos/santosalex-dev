/**
 * POST /api/chat
 *
 * Public route — no authentication required.
 * Implements the full RAG chat pipeline:
 *   1. Validate body
 *   2. Rate limit (minute + day, keyed by hashed IP)
 *   3. Search similar chunks (pgvector)
 *   4. Stream LLM response (OpenAI streaming)
 *   5. Persist user + assistant messages
 *
 * Response: SSE stream (text/event-stream)
 *   - Each delta: data: {"chunk":"..."}\n\n
 *   - End signal:  data: {"done":true}\n\n
 *   - Error:       data: {"error":"..."}\n\n
 */

import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOpenAI, aiConfig } from "@/lib/ai/provider";
import { searchSimilarChunks } from "@/lib/ai/rag";
import { portfolioAssistantSystemPrompt } from "@/lib/ai/prompts";
import { checkChatRateLimits } from "@/lib/rate-limit";
import type { RagChunk } from "@/lib/ai/rag";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const chatBodySchema = z.object({
  message: z.string().min(1).max(2000),
  locale: z.enum(["pt-BR", "en"]),
  sessionId: z.string().uuid(),
  sourceType: z.enum(["project", "post"]).optional(),
  sourceId: z.string().optional(),
});

// ---------------------------------------------------------------------------
// No-context messages (don't burn LLM tokens if nothing retrieved)
// ---------------------------------------------------------------------------

const NO_CONTEXT_MSG: Record<string, string> = {
  "pt-BR":
    "Não encontrei informações suficientes no meu banco de conhecimento para responder isso. Tente perguntar sobre os projetos, a stack ou o perfil do Alex.",
  en: "I couldn't find enough information in my knowledge base to answer that. Try asking about Alex's projects, tech stack, or background.",
};

// ---------------------------------------------------------------------------
// IP extraction + hashing
// ---------------------------------------------------------------------------

function extractAndHashIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const real = req.headers.get("x-real-ip");
  const raw = forwarded?.split(",")[0]?.trim() ?? real ?? "127.0.0.1";
  return createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

// ---------------------------------------------------------------------------
// SSE helpers
// ---------------------------------------------------------------------------

function sseChunk(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // 1. Parse + validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = chatBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join("; ") },
      { status: 400 },
    );
  }

  const { message, locale, sessionId, sourceType, sourceId } = parsed.data;

  // 2. Rate limit
  const ipHash = extractAndHashIp(req);
  let rateLimitResult;
  try {
    rateLimitResult = await checkChatRateLimits(ipHash);
  } catch (err) {
    // Redis unavailable — fail open (allow the request)
    console.warn("[chat] Rate limit check failed (Redis down?), allowing:", err);
    rateLimitResult = { allowed: true as const };
  }

  if (!rateLimitResult.allowed) {
    const retryAt = rateLimitResult.resetAt.toISOString();
    const errorMsg =
      locale === "pt-BR"
        ? `Você atingiu o limite de uso por ${rateLimitResult.reason === "minute" ? "minuto" : "dia"}. Tente novamente às ${new Date(retryAt).toLocaleTimeString("pt-BR")}.`
        : `You've reached the ${rateLimitResult.reason === "minute" ? "per-minute" : "daily"} usage limit. Try again at ${new Date(retryAt).toLocaleTimeString("en")}.`;

    return NextResponse.json(
      { error: errorMsg, retryAt },
      { status: 429 },
    );
  }

  // 3. Vector search
  let chunks: RagChunk[] = [];
  try {
    chunks = await searchSimilarChunks({
      query: message,
      locale,
      topK: 5,
      threshold: 0.6,
      filter: sourceType ? { sourceType, sourceId } : undefined,
    });
  } catch (err) {
    console.error("[chat] RAG search failed:", err);
    chunks = [];
  }

  // 4. Persist user turn (fire-and-forget style — don't block stream start)
  const persistUser = prisma.aiChatMessage
    .create({
      data: {
        sessionId,
        role: "user",
        content: message,
        ipHash,
        locale,
      },
    })
    .catch((err) => console.error("[chat] Failed to persist user message:", err));

  // 5. Handle no-context case — return polite message without LLM call
  if (chunks.length === 0) {
    await persistUser;

    const noContextMsg = NO_CONTEXT_MSG[locale] ?? NO_CONTEXT_MSG["en"];

    // Still persist as assistant turn so chat logs are complete
    await prisma.aiChatMessage
      .create({
        data: {
          sessionId,
          role: "assistant",
          content: noContextMsg,
          locale,
        },
      })
      .catch((err) =>
        console.error("[chat] Failed to persist no-context reply:", err),
      );

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(sseChunk({ chunk: noContextMsg })),
        );
        controller.enqueue(
          new TextEncoder().encode(sseChunk({ done: true })),
        );
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

  // 6. Build context string from retrieved chunks
  const contextBlocks = chunks
    .map((c, i) => {
      const provenance = `[${c.documentTitle} — chunk ${(c.metadata.chunkIndex as number ?? i) + 1}]`;
      return `${provenance}\n${c.content}`;
    })
    .join("\n\n---\n\n");

  const systemPrompt =
    portfolioAssistantSystemPrompt(locale) +
    `\n\n---\nCONTEXT:\n${contextBlocks}`;

  // 7. Ensure user turn is persisted before streaming
  await persistUser;

  // 8. Stream LLM response
  let openai;
  try {
    openai = getOpenAI();
  } catch (err) {
    console.error("[chat] OpenAI not configured:", err);

    const errorMsg =
      locale === "pt-BR"
        ? "O assistente de IA está temporariamente indisponível. Tente novamente mais tarde."
        : "The AI assistant is temporarily unavailable. Please try again later.";

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
  let fullText = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await openai.chat.completions.create({
          model: aiConfig.chatModel,
          stream: true,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: 0.4,
          max_tokens: 800,
        });

        for await (const part of completion) {
          const delta = part.choices[0]?.delta?.content ?? "";
          if (delta) {
            fullText += delta;
            controller.enqueue(encoder.encode(sseChunk({ chunk: delta })));
          }
        }

        controller.enqueue(encoder.encode(sseChunk({ done: true })));
        controller.close();

        // 9. Persist assistant turn after stream completes
        await prisma.aiChatMessage
          .create({
            data: {
              sessionId,
              role: "assistant",
              content: fullText,
              locale,
            },
          })
          .catch((err) =>
            console.error("[chat] Failed to persist assistant message:", err),
          );
      } catch (err) {
        console.error("[chat] LLM streaming error:", err);

        const errorMsg =
          locale === "pt-BR"
            ? "Ocorreu um erro ao processar sua mensagem. Tente novamente."
            : "An error occurred while processing your message. Please try again.";

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
