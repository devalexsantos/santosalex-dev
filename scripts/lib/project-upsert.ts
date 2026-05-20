/**
 * Upsert helper used by scripts/populate-projects.ts.
 *
 * Mirrors the transaction + RAG-sync logic of saveProject() in the admin
 * server action, but skips the auth check and the redirect() that would
 * blow up outside of a request context. Everything else (transaction,
 * dedupe-and-recreate of relations, syncProjectToAiDocuments) is preserved.
 */

import { prisma } from "@/lib/prisma";
import { syncProjectToAiDocuments } from "@/lib/ai/sync";

type Bilingual = { "pt-BR": string; en: string };

type LocaleContent = {
  problem: string;
  hypothesis: string;
  targetAudience: string;
  technicalDecisions: string;
  learnings: string;
  nextSteps: string;
  fullDescription: string;
};

export interface ProjectPayload {
  slug: string;
  title: string;
  shortDescription: string;
  category:
    | "saas"
    | "ai"
    | "frontend"
    | "fullstack"
    | "automation"
    | "infra"
    | "experiment";
  status: "draft" | "in_progress" | "shipped" | "archived";
  year?: number | null;
  featured?: boolean;
  order?: number;
  demoUrl?: string | null;
  githubUrl?: string | null;
  content: { "pt-BR": LocaleContent; en: LocaleContent };
  architecture: Bilingual;
  challenges: Bilingual;
  readme: Bilingual;
  techSlugs: string[];
  features: { title: Bilingual; description: Bilingual; order: number }[];
  decisions: {
    title: Bilingual;
    description: Bilingual;
    reason: Bilingual;
    order: number;
  }[];
}

export async function upsertProjectFromPayload(p: ProjectPayload): Promise<{
  id: string;
  created: boolean;
}> {
  const existing = await prisma.project.findUnique({
    where: { slug: p.slug },
    select: { id: true },
  });

  const baseData = {
    slug: p.slug,
    title: p.title,
    shortDescription: p.shortDescription,
    category: p.category,
    status: p.status,
    year: p.year ?? null,
    featured: p.featured ?? false,
    order: p.order ?? 0,
    demoUrl: p.demoUrl ?? null,
    githubUrl: p.githubUrl ?? null,
    content: p.content,
    architecture: p.architecture,
    challenges: p.challenges,
    readme: p.readme,
    translationStatus: "reviewed" as const,
  };

  const project = await prisma.$transaction(async (tx) => {
    const proj = existing
      ? await tx.project.update({
          where: { id: existing.id },
          data: baseData,
        })
      : await tx.project.create({ data: baseData });

    const techs = await tx.technology.findMany({
      where: { slug: { in: p.techSlugs } },
      select: { id: true, slug: true },
    });
    const missingTechs = p.techSlugs.filter(
      (s) => !techs.find((t) => t.slug === s),
    );
    if (missingTechs.length > 0) {
      console.warn(
        `[populate] ⚠️  ${p.slug}: missing tech slugs in DB: ${missingTechs.join(", ")}`,
      );
    }

    await tx.projectStack.deleteMany({ where: { projectId: proj.id } });
    if (techs.length > 0) {
      await tx.projectStack.createMany({
        data: techs.map((t) => ({ projectId: proj.id, technologyId: t.id })),
      });
    }

    await tx.projectFeature.deleteMany({ where: { projectId: proj.id } });
    if (p.features.length > 0) {
      await tx.projectFeature.createMany({
        data: p.features.map((f) => ({
          projectId: proj.id,
          title: f.title,
          description: f.description,
          order: f.order,
        })),
      });
    }

    await tx.projectDecision.deleteMany({ where: { projectId: proj.id } });
    if (p.decisions.length > 0) {
      await tx.projectDecision.createMany({
        data: p.decisions.map((d) => ({
          projectId: proj.id,
          title: d.title,
          description: d.description,
          reason: d.reason,
          order: d.order,
        })),
      });
    }

    return proj;
  });

  await syncProjectToAiDocuments(project.id);

  return { id: project.id, created: !existing };
}
