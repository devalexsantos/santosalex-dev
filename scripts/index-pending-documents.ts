/**
 * One-shot backfill: chunk + embed all AiDocument rows with indexed=false.
 *
 * Usage:
 *   npx tsx scripts/index-pending-documents.ts
 *
 * Requires:
 *   - DATABASE_URL in .env pointing to a running Postgres with pgvector
 *   - OPENAI_API_KEY in .env
 *
 * After Phase 5 ships, admin can also trigger this via the "Indexar pendentes"
 * button in /admin/ai-documents. This script is for one-shot CLI backfills.
 */

import "dotenv/config";
import { indexAllPendingDocuments } from "../src/lib/ai/indexing";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("=== Index Pending AiDocuments ===\n");

  // Quick preview
  const pending = await prisma.aiDocument.findMany({
    where: { indexed: false },
    select: { id: true, title: true, locale: true, sourceType: true },
  });

  if (pending.length === 0) {
    console.log("No pending documents found. All documents are already indexed.");
    return;
  }

  console.log(`Found ${pending.length} pending document(s):`);
  for (const d of pending) {
    console.log(`  - ${d.title} (${d.locale}, ${d.sourceType})`);
  }

  console.log("\nStarting indexing pipeline...\n");

  const result = await indexAllPendingDocuments();

  console.log("\n=== Results ===");
  console.log(`  Processed: ${result.processed}`);
  console.log(`  Failed:    ${result.failed}`);
  console.log(`  Chunks:    ${result.chunks}`);

  if (result.errors.length > 0) {
    console.log("\nErrors:");
    for (const e of result.errors) {
      console.log(`  - ${e.documentId}: ${e.error}`);
    }
  }

  // Quick verification: count chunks in DB
  const chunkCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count FROM "AiChunk"
  `;
  console.log(`\nTotal AiChunk rows in DB: ${chunkCount[0]?.count ?? 0}`);

  // Sample a chunk for verification
  const sample = await prisma.aiChunk.findFirst({
    orderBy: { createdAt: "desc" },
    select: { id: true, content: true, locale: true, documentId: true },
  });

  if (sample) {
    const preview = sample.content.slice(0, 120).replace(/\n/g, " ");
    console.log(`\nSample chunk (most recent):`);
    console.log(`  ID:       ${sample.id}`);
    console.log(`  Locale:   ${sample.locale}`);
    console.log(`  Document: ${sample.documentId}`);
    console.log(`  Preview:  "${preview}..."`);
  }
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .then(() => process.exit(0));
