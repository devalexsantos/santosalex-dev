"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { postSchema, type PostFormValues } from "@/lib/validators/post";
import { translatePostFields } from "@/lib/ai/translate";

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

  // ── Determine EN translation status ──
  // Priority:
  // 1. markReviewed → reviewed
  // 2. PT content changed and previous EN status was translated/reviewed → needs_translation
  // 3. Otherwise keep the incoming status
  let enTranslationStatus = data.translationStatus;

  if (data.markReviewed) {
    enTranslationStatus = "reviewed";
  } else {
    // Check for PT diff if we have a previous EN row
    const existingEn = await prisma.post.findFirst({
      where: { translationGroupId: data.translationGroupId, locale: "en" },
      select: { translationStatus: true },
    });
    const existingPt = await prisma.post.findFirst({
      where: { translationGroupId: data.translationGroupId, locale: "pt-BR" },
      select: { title: true, excerpt: true, content: true },
    });

    if (
      existingEn &&
      (existingEn.translationStatus === "translated" || existingEn.translationStatus === "reviewed")
    ) {
      // Check if PT content changed
      const ptChanged =
        existingPt?.title !== data["pt-BR"].title ||
        existingPt?.excerpt !== data["pt-BR"].excerpt ||
        existingPt?.content !== data["pt-BR"].content;

      if (ptChanged) {
        enTranslationStatus = "needs_translation";
      }
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const locale of locales) {
        const version = data[locale];
        // PT rows are the source — always mark them as reviewed
        const rowTranslationStatus = locale === "pt-BR" ? "reviewed" : enTranslationStatus;

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
              translationStatus: rowTranslationStatus,
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
              translationStatus: rowTranslationStatus,
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
// translatePostToEn — AI-assisted EN translation
//
// Design: Like translateProjectToEn, returns translated fields for client-side
// prefill. Status is immediately committed to DB (translated). The form
// still requires an explicit "Salvar" to persist final content.
// EN row is never auto-published.
// ---------------------------------------------------------------------------

export type TranslatePostResult =
  | {
      ok: true;
      enFields: {
        slug: string;
        title: string;
        excerpt: string;
        content: string;
        seoTitle: string;
        seoDescription: string;
      };
      translationStatus: "translated";
    }
  | { ok: false; error: string };

export async function translatePostToEn(groupId: string): Promise<TranslatePostResult> {
  await requireAdminSession();

  const ptPost = await prisma.post.findFirst({
    where: { translationGroupId: groupId, locale: "pt-BR" },
  });

  if (!ptPost) {
    return { ok: false, error: "Post PT-BR não encontrado para este grupo." };
  }

  let translated;
  try {
    translated = await translatePostFields({
      title: ptPost.title,
      excerpt: ptPost.excerpt,
      content: ptPost.content,
      seoTitle: ptPost.seoTitle ?? undefined,
      seoDescription: ptPost.seoDescription ?? undefined,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao traduzir.",
    };
  }

  // Derive EN slug from EN title (kebab-case, no accents)
  const enSlug = translated.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  const enData = {
    slug: enSlug,
    title: translated.title,
    excerpt: translated.excerpt,
    content: translated.content,
    seoTitle: translated.seoTitle ?? "",
    seoDescription: translated.seoDescription ?? "",
  };

  // Upsert the EN row — never auto-published
  const existingEn = await prisma.post.findFirst({
    where: { translationGroupId: groupId, locale: "en" },
  });

  if (existingEn) {
    await prisma.post.update({
      where: { id: existingEn.id },
      data: {
        slug: enData.slug,
        title: enData.title,
        excerpt: enData.excerpt,
        content: enData.content,
        seoTitle: enData.seoTitle || null,
        seoDescription: enData.seoDescription || null,
        translationStatus: "translated",
        // published stays as-is — we never auto-publish
      },
    });
  } else {
    await prisma.post.create({
      data: {
        slug: enData.slug,
        locale: "en",
        translationGroupId: groupId,
        title: enData.title,
        excerpt: enData.excerpt,
        content: enData.content,
        seoTitle: enData.seoTitle || null,
        seoDescription: enData.seoDescription || null,
        category: ptPost.category,
        tags: ptPost.tags,
        published: false, // never auto-publish
        publishedAt: null,
        readingTime: ptPost.readingTime,
        coverImage: ptPost.coverImage,
        translationStatus: "translated",
      },
    });
  }

  // Revalidate
  revalidatePath("/en/build-notes", "layout");
  revalidatePath(`/en/build-notes/${enData.slug}`, "page");

  return {
    ok: true,
    enFields: enData,
    translationStatus: "translated",
  };
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
