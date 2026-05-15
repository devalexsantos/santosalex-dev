"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { projectSchema, type ProjectFormValues } from "@/lib/validators/project";

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
            year: data.year ?? null,
            featured: data.featured,
            order: data.order,
            coverImage,
            demoUrl,
            githubUrl,
            content: data.content,
            architecture: data.architecture,
            challenges: data.challenges,
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
      });
    } else {
      // --- CREATE ---
      await prisma.$transaction(async (tx) => {
        const project = await tx.project.create({
          data: {
            slug: data.slug,
            title: data.title,
            shortDescription: data.shortDescription,
            category: data.category,
            status: data.status,
            year: data.year ?? null,
            featured: data.featured,
            order: data.order,
            coverImage,
            demoUrl,
            githubUrl,
            content: data.content,
            architecture: data.architecture,
            challenges: data.challenges,
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
      });
    }
  } catch (err) {
    console.error("saveProject error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return { error: "Esse slug já está em uso." };
    }
    return { error: "Erro ao salvar projeto. Tente novamente." };
  }

  // Revalidate public pages in both locales
  for (const locale of ["pt-BR", "en"]) {
    revalidatePath(`/${locale}/projects`, "layout");
    revalidatePath(`/${locale}/projects/${data.slug}`, "page");
  }

  redirect("/admin/projects");
}

// ---------------------------------------------------------------------------
// deleteProject
// ---------------------------------------------------------------------------

export async function deleteProject(projectId: string): Promise<{ error?: string }> {
  await requireAdminSession();

  try {
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
