"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { projectSchema, type ProjectFormValues } from "@/lib/validators/project";
import { translateProjectFields } from "@/lib/ai/translate";
import { syncProjectToAiDocuments, removeAiDocumentsForProject } from "@/lib/ai/sync";

// ---------------------------------------------------------------------------
// saveProject — create or update a project with all relations
// ---------------------------------------------------------------------------

export async function saveProject(
  projectId: string | null,
  rawData: ProjectFormValues
): Promise<{ error?: string }> {
  await requireAdminSession();

  const parsed = projectSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }

  const data = parsed.data;

  // Normalize empty URL strings to null
  const coverImage = data.coverImage || null;
  const demoUrl = data.demoUrl || null;
  const githubUrl = data.githubUrl || null;

  // Drop gallery rows with no uploaded image; re-sequence order from position.
  const images = data.images
    .filter((img) => img.url)
    .map((img, idx) => ({
      url: img.url,
      caption: img.caption || null,
      order: idx + 1,
    }));

  // ── Determine the translation status to persist ──
  // Priority order:
  // 1. If markReviewed is true → reviewed (user explicitly confirmed)
  // 2. If PT content changed since last save AND previous status was
  //    translated or reviewed → needs_translation (source diverged)
  // 3. Otherwise, keep the incoming status from the form
  let translationStatus = data.translationStatus;

  if (data.markReviewed) {
    translationStatus = "reviewed";
  } else if (projectId) {
    // Detect PT diff: compare new PT fields against what's in the DB
    const existing = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        content: true,
        architecture: true,
        challenges: true,
        readme: true,
        translationStatus: true,
      },
    });

    if (existing) {
      const prevStatus = existing.translationStatus;

      if (prevStatus === "translated" || prevStatus === "reviewed") {
        // Compare PT-BR content snapshot
        type RawContent = { "pt-BR"?: Record<string, string> };
        const prevContent = existing.content as RawContent | null;
        const prevArch = existing.architecture as { "pt-BR"?: string } | null;
        const prevChallenges = existing.challenges as { "pt-BR"?: string } | null;
        const prevReadme = existing.readme as { "pt-BR"?: string } | null;

        const ptPrev = JSON.stringify({
          ...prevContent?.["pt-BR"],
          architecture: prevArch?.["pt-BR"] ?? "",
          challenges: prevChallenges?.["pt-BR"] ?? "",
          readme: prevReadme?.["pt-BR"] ?? "",
        });

        const ptNew = JSON.stringify({
          ...data.content["pt-BR"],
          architecture: data.architecture["pt-BR"],
          challenges: data.challenges["pt-BR"],
          readme: data.readme["pt-BR"],
        });

        if (ptPrev !== ptNew) {
          translationStatus = "needs_translation";
        }
      }
    }
  }

  let savedProjectId: string | null = projectId;

  try {
    if (projectId) {
      // --- UPDATE ---
      await prisma.$transaction(async (tx) => {
        await tx.project.update({
          where: { id: projectId },
          data: {
            slug: data.slug,
            title: data.title,
            shortDescription: data.shortDescription,
            category: data.category,
            status: data.status,
            translationStatus,
            year: data.year ?? null,
            featured: data.featured,
            order: data.order,
            coverImage,
            demoUrl,
            githubUrl,
            content: data.content,
            architecture: data.architecture,
            challenges: data.challenges,
            readme: data.readme,
          },
        });

        // Resolve tech ids
        const technologies = await tx.technology.findMany({
          where: { slug: { in: data.techSlugs } },
          select: { id: true },
        });

        // Delete + recreate relations (simpler than diffing)
        await tx.projectStack.deleteMany({ where: { projectId } });
        if (technologies.length > 0) {
          await tx.projectStack.createMany({
            data: technologies.map((t) => ({ projectId: projectId!, technologyId: t.id })),
          });
        }

        await tx.projectFeature.deleteMany({ where: { projectId } });
        if (data.features.length > 0) {
          await tx.projectFeature.createMany({
            data: data.features.map((f) => ({
              projectId: projectId!,
              title: f.title,
              description: f.description,
              order: f.order,
            })),
          });
        }

        await tx.projectDecision.deleteMany({ where: { projectId } });
        if (data.decisions.length > 0) {
          await tx.projectDecision.createMany({
            data: data.decisions.map((d) => ({
              projectId: projectId!,
              title: d.title,
              description: d.description,
              reason: d.reason,
              order: d.order,
            })),
          });
        }

        await tx.projectImage.deleteMany({ where: { projectId } });
        if (images.length > 0) {
          await tx.projectImage.createMany({
            data: images.map((img) => ({
              projectId: projectId!,
              url: img.url,
              caption: img.caption,
              order: img.order,
            })),
          });
        }
      });
    } else {
      // --- CREATE ---
      const created = await prisma.$transaction(async (tx) => {
        const project = await tx.project.create({
          data: {
            slug: data.slug,
            title: data.title,
            shortDescription: data.shortDescription,
            category: data.category,
            status: data.status,
            translationStatus: "draft", // always draft on creation
            year: data.year ?? null,
            featured: data.featured,
            order: data.order,
            coverImage,
            demoUrl,
            githubUrl,
            content: data.content,
            architecture: data.architecture,
            challenges: data.challenges,
            readme: data.readme,
          },
        });

        const technologies = await tx.technology.findMany({
          where: { slug: { in: data.techSlugs } },
          select: { id: true },
        });

        if (technologies.length > 0) {
          await tx.projectStack.createMany({
            data: technologies.map((t) => ({ projectId: project.id, technologyId: t.id })),
          });
        }

        if (data.features.length > 0) {
          await tx.projectFeature.createMany({
            data: data.features.map((f) => ({
              projectId: project.id,
              title: f.title,
              description: f.description,
              order: f.order,
            })),
          });
        }

        if (data.decisions.length > 0) {
          await tx.projectDecision.createMany({
            data: data.decisions.map((d) => ({
              projectId: project.id,
              title: d.title,
              description: d.description,
              reason: d.reason,
              order: d.order,
            })),
          });
        }

        if (images.length > 0) {
          await tx.projectImage.createMany({
            data: images.map((img) => ({
              projectId: project.id,
              url: img.url,
              caption: img.caption,
              order: img.order,
            })),
          });
        }

        return project.id;
      });
      savedProjectId = created;
    }
  } catch (err) {
    console.error("saveProject error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return { error: "Esse slug já está em uso." };
    }
    return { error: "Erro ao salvar projeto. Tente novamente." };
  }

  // Sync the AiDocument mirror so the RAG sees the latest content.
  // Best-effort: failure here doesn't block the save — log and continue.
  if (savedProjectId) {
    try {
      await syncProjectToAiDocuments(savedProjectId);
    } catch (err) {
      console.error("syncProjectToAiDocuments error:", err);
    }
  }

  // Revalidate public pages in both locales
  for (const locale of ["pt-BR", "en"]) {
    revalidatePath(`/${locale}/projects`, "layout");
    revalidatePath(`/${locale}/projects/${data.slug}`, "page");
  }

  redirect("/admin/projects");
}

// ---------------------------------------------------------------------------
// translateProjectToEn — AI-assisted EN translation
//
// Design: Returns the translated EN fields so the client can prefill form
// values without a full page reload. The form still requires an explicit
// "Salvar" to persist. This avoids the awkward "page refreshed under you"
// UX. The status is immediately committed to the DB (translated), but the
// EN form fields are populated client-side for the human to review + save.
// ---------------------------------------------------------------------------

export type TranslateProjectResult =
  | { ok: true; enFields: { content: Record<string, string>; architecture: string; challenges: string }; translationStatus: "translated" }
  | { ok: false; error: string };

export async function translateProjectToEn(projectId: string): Promise<TranslateProjectResult> {
  await requireAdminSession();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      content: true,
      architecture: true,
      challenges: true,
      slug: true,
    },
  });

  if (!project) {
    return { ok: false, error: "Projeto não encontrado." };
  }

  type RawContent = { "pt-BR"?: Record<string, string>; en?: Record<string, string> };
  const rawContent = project.content as RawContent | null;
  const ptContent = rawContent?.["pt-BR"] ?? {};
  const ptArch = (project.architecture as { "pt-BR"?: string } | null)?.["pt-BR"] ?? "";
  const ptChallenges = (project.challenges as { "pt-BR"?: string } | null)?.["pt-BR"] ?? "";

  // Build the translation input — include only non-empty fields
  const input = {
    ...(ptContent.fullDescription ? { fullDescription: ptContent.fullDescription } : {}),
    ...(ptContent.problem ? { problem: ptContent.problem } : {}),
    ...(ptContent.hypothesis ? { hypothesis: ptContent.hypothesis } : {}),
    ...(ptContent.targetAudience ? { targetAudience: ptContent.targetAudience } : {}),
    ...(ptContent.technicalDecisions ? { technicalDecisions: ptContent.technicalDecisions } : {}),
    ...(ptContent.learnings ? { learnings: ptContent.learnings } : {}),
    ...(ptContent.nextSteps ? { nextSteps: ptContent.nextSteps } : {}),
    ...(ptArch ? { architecture: ptArch } : {}),
    ...(ptChallenges ? { challenges: ptChallenges } : {}),
  };

  let translated;
  try {
    translated = await translateProjectFields(input);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao traduzir.",
    };
  }

  // Merge translated content into existing EN JSON (preserve existing PT side)
  const existingEnContent = rawContent?.en ?? {};
  const newEnContent: Record<string, string> = {
    ...existingEnContent,
    ...(translated.fullDescription !== undefined ? { fullDescription: translated.fullDescription } : {}),
    ...(translated.problem !== undefined ? { problem: translated.problem } : {}),
    ...(translated.hypothesis !== undefined ? { hypothesis: translated.hypothesis } : {}),
    ...(translated.targetAudience !== undefined ? { targetAudience: translated.targetAudience } : {}),
    ...(translated.technicalDecisions !== undefined ? { technicalDecisions: translated.technicalDecisions } : {}),
    ...(translated.learnings !== undefined ? { learnings: translated.learnings } : {}),
    ...(translated.nextSteps !== undefined ? { nextSteps: translated.nextSteps } : {}),
  };

  const newArchitecture = translated.architecture ?? ptArch;
  const newChallenges = translated.challenges ?? ptChallenges;

  // Persist to DB with translationStatus: translated
  // This means: AI drafted EN, awaiting human review. Never auto-publishes.
  await prisma.project.update({
    where: { id: projectId },
    data: {
      content: {
        "pt-BR": ptContent,
        en: newEnContent,
      },
      architecture: {
        "pt-BR": ptArch,
        en: newArchitecture,
      },
      challenges: {
        "pt-BR": ptChallenges,
        en: newChallenges,
      },
      translationStatus: "translated",
    },
  });

  // Re-sync AiDocument now that EN content has been (re)generated
  try {
    await syncProjectToAiDocuments(projectId);
  } catch (err) {
    console.error("syncProjectToAiDocuments error (after translate):", err);
  }

  // Revalidate public pages
  for (const locale of ["pt-BR", "en"]) {
    revalidatePath(`/${locale}/projects/${project.slug}`, "page");
  }

  return {
    ok: true,
    enFields: {
      content: newEnContent,
      architecture: newArchitecture,
      challenges: newChallenges,
    },
    translationStatus: "translated",
  };
}

// ---------------------------------------------------------------------------
// deleteProject
// ---------------------------------------------------------------------------

export async function deleteProject(projectId: string): Promise<{ error?: string }> {
  await requireAdminSession();

  try {
    // Remove mirrored AiDocuments first — they hold sourceId as a loose FK
    await removeAiDocumentsForProject(projectId);

    // Cascade deletes handle features/decisions/stack via schema onDelete: Cascade
    const project = await prisma.project.delete({ where: { id: projectId } });

    for (const locale of ["pt-BR", "en"]) {
      revalidatePath(`/${locale}/projects`, "layout");
      revalidatePath(`/${locale}/projects/${project.slug}`, "page");
    }
  } catch (err) {
    console.error("deleteProject error:", err);
    return { error: "Erro ao excluir projeto." };
  }

  return {};
}
