/**
 * Embedding indexing pipeline.
 *
 * Responsibilities:
 * - Load AiDocument rows
 * - Chunk content via chunkText
 * - Generate embeddings via embedMany
 * - Write AiChunk rows via raw SQL (embedding is Unsupported("vector(1536)"))
 * - Mark AiDocument.indexed = true on success
 *
 * Raw SQL rationale: Prisma's TypeScript client omits Unsupported columns
 * entirely, so $executeRaw is required for any write that includes the
 * `embedding` field.
 */

import { prisma } from "@/lib/prisma";
import { chunkText } from "./chunk";
import { embedMany } from "./embeddings";
import { randomUUID } from "crypto";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts a number[] embedding to a Postgres vector literal.
 * e.g. [0.1, 0.2, 0.3] → "[0.1,0.2,0.3]"
 */
function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

// ---------------------------------------------------------------------------
// Single document indexing
// ---------------------------------------------------------------------------

export type IndexResult = {
  ok: true;
  chunks: number;
  documentId: string;
};

export type IndexError = {
  ok: false;
  error: string;
  documentId: string;
};

export async function indexAiDocument(
  documentId: string,
): Promise<IndexResult | IndexError> {
  // 1. Load the document
  const doc = await prisma.aiDocument.findUnique({
    where: { id: documentId },
  });

  if (!doc) {
    return {
      ok: false,
      error: `AiDocument not found: ${documentId}`,
      documentId,
    };
  }

  try {
    // 2. Delete existing chunks (Prisma can handle this — no embedding column touched)
    await prisma.aiChunk.deleteMany({ where: { documentId } });

    // 3. Chunk the content
    const chunks = chunkText(doc.content, {
      maxChars: 800,
      overlapChars: 150,
      title: doc.title,
    });

    if (chunks.length === 0) {
      // Empty content — mark as indexed with 0 chunks
      await prisma.aiDocument.update({
        where: { id: documentId },
        data: { indexed: true, updatedAt: new Date() },
      });
      return { ok: true, chunks: 0, documentId };
    }

    // 4. Generate embeddings in batch
    const chunkTexts = chunks.map((c) => c.content);
    const embeddings = await embedMany(chunkTexts);

    // 5. Insert chunks with raw SQL — embedding must be cast to vector
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = embeddings[i];
      const id = randomUUID();
      const vectorLiteral = toVectorLiteral(embedding);
      const metadataJson = JSON.stringify({
        ...chunk.metadata,
        sourceType: doc.sourceType,
        sourceId: doc.sourceId,
        documentTitle: doc.title,
      });

      await prisma.$executeRaw`
        INSERT INTO "AiChunk" (id, "documentId", content, embedding, metadata, locale, "createdAt")
        VALUES (
          ${id},
          ${documentId},
          ${chunk.content},
          ${vectorLiteral}::vector,
          ${metadataJson}::jsonb,
          ${doc.locale},
          NOW()
        )
      `;
    }

    // 6. Mark document as indexed
    await prisma.aiDocument.update({
      where: { id: documentId },
      data: { indexed: true, updatedAt: new Date() },
    });

    return { ok: true, chunks: chunks.length, documentId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[indexing] Failed to index document ${documentId}:`, err);

    // Leave indexed=false so the queue stays correct
    return {
      ok: false,
      error: message,
      documentId,
    };
  }
}

// ---------------------------------------------------------------------------
// Bulk indexing
// ---------------------------------------------------------------------------

export type BulkIndexResult = {
  processed: number;
  failed: number;
  chunks: number;
  errors: Array<{ documentId: string; error: string }>;
};

/**
 * Iterates all AiDocument rows with indexed=false and calls indexAiDocument
 * on each. Sequential (not parallel) to avoid overwhelming the OpenAI API
 * within a single request context.
 */
export async function indexAllPendingDocuments(): Promise<BulkIndexResult> {
  const pending = await prisma.aiDocument.findMany({
    where: { indexed: false },
    select: { id: true, title: true },
    orderBy: { updatedAt: "asc" },
  });

  let processed = 0;
  let failed = 0;
  let totalChunks = 0;
  const errors: Array<{ documentId: string; error: string }> = [];

  console.log(`[indexing] Starting bulk index of ${pending.length} documents`);

  for (const doc of pending) {
    console.log(`[indexing] Indexing "${doc.title}" (${doc.id})`);
    const result = await indexAiDocument(doc.id);

    if (result.ok) {
      processed++;
      totalChunks += result.chunks;
      console.log(`[indexing]   → ${result.chunks} chunks`);
    } else {
      failed++;
      errors.push({ documentId: doc.id, error: result.error });
      console.error(`[indexing]   → ERROR: ${result.error}`);
    }
  }

  console.log(
    `[indexing] Bulk complete: ${processed} ok, ${failed} failed, ${totalChunks} total chunks`,
  );

  return { processed, failed, chunks: totalChunks, errors };
}
