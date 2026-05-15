/**
 * RAG vector search — retrieves semantically similar AiChunk rows.
 *
 * Uses pgvector cosine distance operator (<=>).
 * Raw SQL is required because AiChunk.embedding is Unsupported("vector(1536)")
 * and Prisma's TypeScript client omits the column entirely.
 *
 * Locale fallback strategy:
 * - Primary: search the requested locale (e.g. "pt-BR")
 * - Fallback: if fewer than MIN_RESULTS primary results survive the threshold,
 *   run a secondary query in the other locale and append up to topK more results
 *   (marked with metadata.fallbackLocale = true).
 * - The system prompt always instructs the LLM to answer in the interface locale,
 *   so mixing source locales in context is safe — only the response language matters.
 */

import { prisma } from "@/lib/prisma";
import { embed } from "./embeddings";

// Minimum primary-locale results before we trigger fallback
const MIN_RESULTS = 2;

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type RagSearchOptions = {
  query: string;
  locale: "pt-BR" | "en";
  /** Maximum results per locale pass. Default: 5 */
  topK?: number;
  /** Cosine distance ceiling — lower is more similar. Default: 0.6 */
  threshold?: number;
  filter?: {
    sourceType?: "project" | "post";
    sourceId?: string;
  };
};

export type RagChunk = {
  id: string;
  content: string;
  /** Cosine distance from query (0 = identical, 2 = opposite). Lower is better. */
  distance: number;
  documentId: string;
  documentTitle: string;
  sourceType: string;
  sourceId: string | null;
  locale: string;
  metadata: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Internal DB row type returned by $queryRaw
// ---------------------------------------------------------------------------

type ChunkRow = {
  id: string;
  content: string;
  metadata: Record<string, unknown> | null;
  locale: string;
  documentId: string;
  document_title: string;
  sourceType: string;
  sourceId: string | null;
  document_metadata: Record<string, unknown> | null;
  distance: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

function otherLocale(locale: "pt-BR" | "en"): "pt-BR" | "en" {
  return locale === "pt-BR" ? "en" : "pt-BR";
}

function rowToRagChunk(row: ChunkRow, fallback = false): RagChunk {
  return {
    id: row.id,
    content: row.content,
    distance: Number(row.distance),
    documentId: row.documentId,
    documentTitle: row.document_title,
    sourceType: row.sourceType,
    sourceId: row.sourceId,
    locale: row.locale,
    metadata: {
      ...(row.metadata ?? {}),
      ...(fallback ? { fallbackLocale: true } : {}),
    },
  };
}

// ---------------------------------------------------------------------------
// Core search
// ---------------------------------------------------------------------------

async function runSearch(opts: {
  vectorLiteral: string;
  locale: string;
  topK: number;
  sourceType?: string;
  sourceId?: string;
}): Promise<ChunkRow[]> {
  const { vectorLiteral, locale, topK, sourceType, sourceId } = opts;

  // We cannot use conditional parameter binding inside tagged template literals
  // cleanly, so we branch on whether filters are present.
  // All four variants share the same SELECT/ORDER — only WHERE differs.

  if (sourceType && sourceId) {
    return prisma.$queryRaw<ChunkRow[]>`
      SELECT
        c.id,
        c.content,
        c.metadata,
        c.locale,
        c."documentId",
        d.title AS document_title,
        d."sourceType" AS "sourceType",
        d."sourceId" AS "sourceId",
        d.metadata AS document_metadata,
        (c.embedding <=> ${vectorLiteral}::vector) AS distance
      FROM "AiChunk" c
      JOIN "AiDocument" d ON d.id = c."documentId"
      WHERE c.locale = ${locale}
        AND d."sourceType" = ${sourceType}::"AiDocumentSourceType"
        AND d."sourceId" = ${sourceId}
      ORDER BY c.embedding <=> ${vectorLiteral}::vector
      LIMIT ${topK}
    `;
  }

  if (sourceType && !sourceId) {
    return prisma.$queryRaw<ChunkRow[]>`
      SELECT
        c.id,
        c.content,
        c.metadata,
        c.locale,
        c."documentId",
        d.title AS document_title,
        d."sourceType" AS "sourceType",
        d."sourceId" AS "sourceId",
        d.metadata AS document_metadata,
        (c.embedding <=> ${vectorLiteral}::vector) AS distance
      FROM "AiChunk" c
      JOIN "AiDocument" d ON d.id = c."documentId"
      WHERE c.locale = ${locale}
        AND d."sourceType" = ${sourceType}::"AiDocumentSourceType"
      ORDER BY c.embedding <=> ${vectorLiteral}::vector
      LIMIT ${topK}
    `;
  }

  if (!sourceType && sourceId) {
    return prisma.$queryRaw<ChunkRow[]>`
      SELECT
        c.id,
        c.content,
        c.metadata,
        c.locale,
        c."documentId",
        d.title AS document_title,
        d."sourceType" AS "sourceType",
        d."sourceId" AS "sourceId",
        d.metadata AS document_metadata,
        (c.embedding <=> ${vectorLiteral}::vector) AS distance
      FROM "AiChunk" c
      JOIN "AiDocument" d ON d.id = c."documentId"
      WHERE c.locale = ${locale}
        AND d."sourceId" = ${sourceId}
      ORDER BY c.embedding <=> ${vectorLiteral}::vector
      LIMIT ${topK}
    `;
  }

  // No filter
  return prisma.$queryRaw<ChunkRow[]>`
    SELECT
      c.id,
      c.content,
      c.metadata,
      c.locale,
      c."documentId",
      d.title AS document_title,
      d."sourceType" AS "sourceType",
      d."sourceId" AS "sourceId",
      d.metadata AS document_metadata,
      (c.embedding <=> ${vectorLiteral}::vector) AS distance
    FROM "AiChunk" c
    JOIN "AiDocument" d ON d.id = c."documentId"
    WHERE c.locale = ${locale}
    ORDER BY c.embedding <=> ${vectorLiteral}::vector
    LIMIT ${topK}
  `;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function searchSimilarChunks(
  options: RagSearchOptions,
): Promise<RagChunk[]> {
  const {
    query,
    locale,
    topK = 5,
    threshold = 0.6,
    filter,
  } = options;

  // 1. Embed the query
  const queryEmbedding = await embed(query);
  const vectorLiteral = toVectorLiteral(queryEmbedding);

  // 2. Primary locale search
  const primaryRows = await runSearch({
    vectorLiteral,
    locale,
    topK,
    sourceType: filter?.sourceType,
    sourceId: filter?.sourceId,
  });

  // 3. Filter by threshold
  const primary = primaryRows
    .filter((r) => Number(r.distance) <= threshold)
    .map((r) => rowToRagChunk(r, false));

  // 4. Locale fallback — only when primary results are scarce
  if (primary.length >= MIN_RESULTS) {
    return primary;
  }

  const fallbackLocale = otherLocale(locale);
  const fallbackRows = await runSearch({
    vectorLiteral,
    locale: fallbackLocale,
    topK,
    sourceType: filter?.sourceType,
    sourceId: filter?.sourceId,
  });

  const fallback = fallbackRows
    .filter((r) => Number(r.distance) <= threshold)
    .map((r) => rowToRagChunk(r, true));

  // Combine: primary first, then fallback (up to topK total)
  const combined = [...primary, ...fallback];
  return combined.slice(0, topK);
}
