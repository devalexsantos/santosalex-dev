/**
 * One-shot script: sync profile data → AiDocuments → run embedding indexing.
 * Run with: npx tsx src/scripts/sync-profile.ts
 */

import { syncProfileToAiDocuments } from "@/lib/ai/sync";
import { indexAllPendingDocuments } from "@/lib/ai/indexing";

async function main() {
  console.log("Syncing profile to AiDocuments...");
  const syncResult = await syncProfileToAiDocuments();
  console.log("Sync result:", syncResult);

  console.log("\nIndexing all pending documents...");
  const indexResult = await indexAllPendingDocuments();
  console.log("Index result:", {
    processed: indexResult.processed,
    failed: indexResult.failed,
    chunks: indexResult.chunks,
  });
  if (indexResult.errors.length > 0) {
    console.error("Errors:", indexResult.errors);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
