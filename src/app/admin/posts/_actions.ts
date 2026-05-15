"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { postSchema, type PostFormValues } from "@/lib/validators/post";

// ---------------------------------------------------------------------------
// savePost — upsert both locale rows in a transaction
// ---------------------------------------------------------------------------

export async function savePost(rawData: PostFormValues): Promise<{ error?: string } | void> {
  await requireAdminSession();

  const parsed = postSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }

  const data = parsed.data;
  const tags = data.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
  const coverImage = data.coverImage || null;

  const locales: Array<"pt-BR" | "en"> = ["pt-BR", "en"];

  try {
    await prisma.$transaction(async (tx) => {
      for (const locale of locales) {
        const version = data[locale];

        // Use findFirst + update/create pattern (Prisma 7 + pg adapter workaround)
        const existing = await tx.post.findFirst({
          where: { translationGroupId: data.translationGroupId, locale },
        });

        if (existing) {
          await tx.post.update({
            where: { id: existing.id },
            data: {
              slug: version.slug,
              title: version.title,
              excerpt: version.excerpt,
              content: version.content,
              seoTitle: version.seoTitle || null,
              seoDescription: version.seoDescription || null,
              category: data.category,
              tags,
              published: data.published,
              publishedAt,
              readingTime: data.readingTime ?? null,
              coverImage,
              translationGroupId: data.translationGroupId,
            },
          });
        } else {
          await tx.post.create({
            data: {
              slug: version.slug,
              locale,
              translationGroupId: data.translationGroupId,
              title: version.title,
              excerpt: version.excerpt,
              content: version.content,
              seoTitle: version.seoTitle || null,
              seoDescription: version.seoDescription || null,
              category: data.category,
              tags,
              published: data.published,
              publishedAt,
              readingTime: data.readingTime ?? null,
              coverImage,
            },
          });
        }
      }
    });
  } catch (err) {
    console.error("savePost error:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return { error: "Esse slug já está em uso para este locale." };
    }
    return { error: "Erro ao salvar post. Tente novamente." };
  }

  // Revalidate public pages in both locales
  for (const locale of locales) {
    revalidatePath(`/${locale}/build-notes`, "layout");
    const version = data[locale];
    revalidatePath(`/${locale}/build-notes/${version.slug}`, "page");
  }

  redirect("/admin/posts");
}

// ---------------------------------------------------------------------------
// deletePostGroup — deletes all locale versions for a translationGroupId
// ---------------------------------------------------------------------------

export async function deletePostGroup(translationGroupId: string): Promise<{ error?: string }> {
  await requireAdminSession();

  try {
    const posts = await prisma.post.findMany({ where: { translationGroupId } });

    await prisma.post.deleteMany({ where: { translationGroupId } });

    for (const post of posts) {
      for (const locale of ["pt-BR", "en"]) {
        revalidatePath(`/${locale}/build-notes`, "layout");
        revalidatePath(`/${locale}/build-notes/${post.slug}`, "page");
      }
    }
  } catch (err) {
    console.error("deletePostGroup error:", err);
    return { error: "Erro ao excluir post." };
  }

  return {};
}
