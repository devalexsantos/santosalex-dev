/**
 * scripts/populate-projects.ts
 *
 * One-off content populator: writes detailed bilingual project data for the
 * projects listed in scripts/lib/project-payloads.ts. Idempotent — upserts by
 * slug, replaces relations, re-syncs AiDocuments for RAG.
 *
 * Usage:
 *   npx tsx scripts/populate-projects.ts             # all projects
 *   npx tsx scripts/populate-projects.ts advlink     # one slug
 *   npx tsx scripts/populate-projects.ts advlink 0clip
 */

import { prisma } from "@/lib/prisma";
import { projectPayloads } from "./lib/project-payloads";
import { upsertProjectFromPayload } from "./lib/project-upsert";

async function main() {
  const args = process.argv.slice(2);
  const filter = args.length > 0 ? new Set(args) : null;

  const toRun = filter
    ? projectPayloads.filter((p) => filter.has(p.slug))
    : projectPayloads;

  if (filter && toRun.length === 0) {
    console.error(
      `[populate] No matches for slugs: ${Array.from(filter).join(", ")}`,
    );
    process.exit(1);
  }

  console.log(`[populate] processing ${toRun.length} project(s)...`);

  let ok = 0;
  let failed = 0;
  for (const payload of toRun) {
    try {
      const result = await upsertProjectFromPayload(payload);
      console.log(
        `[populate] ${result.created ? "+ created" : "~ updated"} ${payload.slug} (id=${result.id})`,
      );
      ok++;
    } catch (err) {
      console.error(`[populate] ✗ ${payload.slug} failed:`, err);
      failed++;
    }
  }

  console.log(`[populate] done. ok=${ok} failed=${failed}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
