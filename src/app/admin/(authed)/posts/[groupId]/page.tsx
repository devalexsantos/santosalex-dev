import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { PostForm } from "@/components/admin/post-form";
import type { PostFormValues } from "@/lib/validators/post";

export const metadata: Metadata = { title: "Editar post" };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  await requireAdminSession();

  const { groupId } = await params;
  const decodedGroupId = decodeURIComponent(groupId);

  const versions = await prisma.post.findMany({
    where: { translationGroupId: decodedGroupId },
  });

  if (versions.length === 0) notFound();

  const ptVersion = versions.find((v) => v.locale === "pt-BR");
  const enVersion = versions.find((v) => v.locale === "en");

  const formatDate = (d: Date | null) =>
    d ? new Date(d).toISOString().slice(0, 16) : "";

  const representative = ptVersion ?? versions[0];

  // Use the EN row's translationStatus as the form's initial value.
  // EN row is the one that gets translated; PT row is always the source.
  const enTranslationStatus = enVersion?.translationStatus ?? "draft";

  const defaultValues: Partial<PostFormValues> = {
    translationGroupId: decodedGroupId,
    category: representative.category as PostFormValues["category"],
    tags: representative.tags.join(", "),
    published: representative.published,
    publishedAt: formatDate(representative.publishedAt),
    readingTime: representative.readingTime ?? null,
    coverImage: representative.coverImage ?? "",
    translationStatus: enTranslationStatus as PostFormValues["translationStatus"],
    markReviewed: false,
    "pt-BR": ptVersion
      ? {
          slug: ptVersion.slug,
          title: ptVersion.title,
          excerpt: ptVersion.excerpt,
          content: ptVersion.content,
          seoTitle: ptVersion.seoTitle ?? "",
          seoDescription: ptVersion.seoDescription ?? "",
        }
      : { slug: "", title: "", excerpt: "", content: "", seoTitle: "", seoDescription: "" },
    en: enVersion
      ? {
          slug: enVersion.slug,
          title: enVersion.title,
          excerpt: enVersion.excerpt,
          content: enVersion.content,
          seoTitle: enVersion.seoTitle ?? "",
          seoDescription: enVersion.seoDescription ?? "",
        }
      : { slug: "", title: "", excerpt: "", content: "", seoTitle: "", seoDescription: "" },
  };

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-8">
        <Link
          href="/admin/posts"
          className="mb-3 flex items-center gap-1.5 text-xs text-white/30 transition-colors hover:text-white/60"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Posts
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Editar — <span className="text-violet-400">{representative.title}</span>
        </h1>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
        <PostForm defaultValues={defaultValues} groupId={decodedGroupId} />
      </div>
    </div>
  );
}
