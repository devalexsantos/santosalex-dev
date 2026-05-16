/**
 * POST /api/playground/rag-search
 *
 * Public endpoint powering the RAG Visualizer demo. Returns the raw chunks
 * `searchSimilarChunks` would feed to the LLM — without calling the LLM.
 *
 * Cheap (one embedding + one DB query), so it gets a separate, looser rate
 * limit than the chat endpoint (which pays for completions).
 *
 * Request: { query, locale, topK }
 * Response 200: { chunks: [{ documentTitle, sourceType, sourceId, locale,
 *                            distance, similarity, content, fallbackLocale }] }
 */
import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { searchSimilarChunks } from "@/lib/ai/rag";
import { checkRateLimit } from "@/lib/rate-limit";
import { ragSearchBodySchema } from "@/lib/validators/playground";

export const dynamic = "force-dynamic";

function ipHash(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const real = req.headers.get("x-real-ip");
  const raw = forwarded?.split(",")[0]?.trim() ?? real ?? "127.0.0.1";
  return createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ragSearchBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join("; ") },
      { status: 400 },
    );
  }

  const { query, locale, topK } = parsed.data;

  // 40 searches per minute per IP — generous for a "play with it" demo,
  // tight enough to deter scraping our embedded knowledge base.
  try {
    const rl = await checkRateLimit({
      key: `pg:rag:${ipHash(req)}`,
      limit: 40,
      windowSeconds: 60,
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many searches. Try again in a minute." },
        { status: 429 },
      );
    }
  } catch (err) {
    console.warn("[playground/rag-search] Redis check failed:", err);
    // Fail open
  }

  try {
    // threshold relaxed slightly vs chat (0.7 vs 0.6) so the visualizer still
    // shows results when the user explores tangential queries.
    const chunks = await searchSimilarChunks({
      query,
      locale,
      topK,
      threshold: 0.7,
    });

    return NextResponse.json({
      chunks: chunks.map((c) => ({
        id: c.id,
        documentTitle: c.documentTitle,
        sourceType: c.sourceType,
        sourceId: c.sourceId,
        locale: c.locale,
        distance: Number(c.distance.toFixed(4)),
        // Cosine similarity convenience: 1 - distance. Easier on UI ("87%").
        similarity: Number(((1 - c.distance) * 100).toFixed(1)),
        content: c.content,
        fallbackLocale: Boolean(c.metadata?.fallbackLocale),
      })),
    });
  } catch (err) {
    console.error("[playground/rag-search] search failed:", err);
    return NextResponse.json(
      { error: "Search failed. Please try again." },
      { status: 500 },
    );
  }
}
