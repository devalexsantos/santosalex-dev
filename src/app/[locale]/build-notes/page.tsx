import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";
import { SectionHeader } from "@/components/ui/section-header";
import { PostCard } from "@/components/blog/post-card";
import { CategoryFilter } from "@/components/projects/category-filter";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "buildNotes" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: `${t("title")} · ${tCommon("siteName")}`,
      description: t("description"),
    },
    alternates: {
      canonical: `/${locale}/build-notes`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/build-notes`])),
    },
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PostCategory =
  | "architecture"
  | "ai"
  | "saas"
  | "frontend"
  | "backend"
  | "infra"
  | "product"
  | "experiment"
  | "deploy"
  | "performance";

// ---------------------------------------------------------------------------
// Filter config
// ---------------------------------------------------------------------------

const FILTER_KEYS = [
  "all",
  "architecture",
  "ai",
  "saas",
  "frontend",
  "backend",
  "infra",
  "product",
  "experiment",
  "deploy",
  "performance",
] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

async function getPosts(locale: string) {
  return prisma.post.findMany({
    where: { locale, published: true },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      category: true,
      tags: true,
      readingTime: true,
      publishedAt: true,
    },
  });
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function BuildNotesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "buildNotes" });

  const filterOptions = FILTER_KEYS.map((key) => ({
    value: key,
    label: t(`filters.${key}`),
  }));

  let posts: Awaited<ReturnType<typeof getPosts>> = [];
  try {
    posts = await getPosts(locale);
  } catch {
    posts = [];
  }

  // Apply filter
  const activeFilter = (category ?? "all") as FilterKey;
  const filtered =
    activeFilter === "all" || !FILTER_KEYS.includes(activeFilter)
      ? posts
      : posts.filter((p) => p.category === activeFilter);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      {/* Hero */}
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        align="center"
        titleGradient
        className="mb-12"
      />

      {/* Category filter chips */}
      <div className="mb-10 flex justify-center">
        <Suspense fallback={null}>
          <CategoryFilter options={filterOptions} paramName="category" />
        </Suspense>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <p className="text-lg font-medium text-muted-foreground">{t("empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => {
            const readingTimeLabel = post.readingTime
              ? t("readingTime", { minutes: post.readingTime })
              : undefined;

            const publishedAtLabel = post.publishedAt
              ? new Intl.DateTimeFormat(locale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }).format(new Date(post.publishedAt))
              : undefined;

            return (
              <PostCard
                key={post.id}
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                category={post.category as PostCategory}
                tags={post.tags}
                locale={locale}
                readingTimeLabel={readingTimeLabel}
                publishedAtLabel={publishedAtLabel}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
