/**
 * One-shot backfill: generate AiDocument rows from every existing Project +
 * published Post. Safe to run repeatedly.
 *
 * Usage:
 *   npx tsx scripts/backfill-ai-documents.ts
 *
 * After Phase 5 ships, the same upserts also happen on every project/post save.
 */

import "dotenv/config";
import { syncAllAiDocuments } from "../src/lib/ai/sync";

async function main() {
  console.log("Syncing AiDocuments from Project + Post…");
  const result = await syncAllAiDocuments();
  console.log(
    `Done. ${result.projects} projects × 2 locales + ${result.posts} published posts.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .then(() => process.exit(0));
