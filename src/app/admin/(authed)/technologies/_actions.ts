"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { technologySchema, type TechnologyFormValues } from "@/lib/validators/technology";

// ---------------------------------------------------------------------------
// saveTechnology — create or update
// ---------------------------------------------------------------------------

export async function saveTechnology(
  technologyId: string | undefined,
  rawData: TechnologyFormValues
): Promise<{ error?: string }> {
  await requireAdminSession();

  const parsed = technologySchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }

  const data = parsed.data;
  const icon = data.icon || null;
  const description = data.description || null;

  try {
    if (technologyId) {
      await prisma.technology.update({
        where: { id: technologyId },
        data: {
          slug: data.slug,
          name: data.name,
          category: data.category,
          experienceLevel: data.experienceLevel,
          icon,
          description,
        },
      });
    } else {
      await prisma.technology.create({
        data: {
          slug: data.slug,
          name: data.name,
          category: data.category,
          experienceLevel: data.experienceLevel,
          icon,
          description,
        },
      });
    }
  } catch (err) {
    console.error("saveTechnology error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return { error: "Esse slug já está em uso." };
    }
    return { error: "Erro ao salvar tecnologia. Tente novamente." };
  }

  // Revalidate public stack page in both locales
  for (const locale of ["pt-BR", "en"]) {
    revalidatePath(`/${locale}/stack`, "page");
  }
  revalidatePath("/admin/technologies");

  redirect("/admin/technologies");
}

// ---------------------------------------------------------------------------
// deleteTechnology
// ---------------------------------------------------------------------------

export async function deleteTechnology(technologyId: string): Promise<{ error?: string }> {
  await requireAdminSession();

  try {
    await prisma.technology.delete({ where: { id: technologyId } });

    for (const locale of ["pt-BR", "en"]) {
      revalidatePath(`/${locale}/stack`, "page");
    }
    revalidatePath("/admin/technologies");
  } catch (err) {
    console.error("deleteTechnology error:", err);
    return { error: "Erro ao excluir tecnologia." };
  }

  return {};
}
