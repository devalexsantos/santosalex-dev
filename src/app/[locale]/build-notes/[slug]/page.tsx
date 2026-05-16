import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Clock, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { routing, type Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { blogPostingSchema, jsonLdScriptProps } from "@/lib/structured-data";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/blog/post-card";
import { PostLocaleSwitcher } from "@/components/blog/post-locale-switcher";
import { cn } from "@/lib/utils";

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
// Static params — only published posts
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { locale: true, slug: true },
  });
  return posts.map((p) => ({ locale: p.locale, slug: p.slug }));
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  const post = await prisma.post.findFirst({ where: { locale, slug } });
  if (!post) return {};

  // Find sibling for alternate link
  const sibling = post.translationGroupId
    ? await prisma.post.findFirst({
        where: {
          translationGroupId: post.translationGroupId,
          locale: { not: locale },
          published: true,
        },
        select: { locale: true, slug: true },
      })
    : null;

  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      ...(post.publishedAt && { publishedTime: post.publishedAt.toISOString() }),
    },
    alternates: {
      languages: {
        [locale]: `/${locale}/build-notes/${slug}`,
        ...(sibling
          ? { [sibling.locale]: `/${sibling.locale}/build-notes/${sibling.slug}` }
          : {}),
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

async function getPost(locale: string, slug: string) {
  return prisma.post.findFirst({ where: { locale, slug } });
}

async function getSiblingPost(
  translationGroupId: string,
  currentLocale: string
) {
  return prisma.post.findFirst({
    where: {
      translationGroupId,
      locale: { not: currentLocale },
      published: true,
    },
    select: { locale: true, slug: true },
  });
}

async function getRelatedPosts(
  category: PostCategory,
  currentId: string,
  translationGroupId: string,
  locale: string
) {
  return prisma.post.findMany({
    where: {
      locale,
      category,
      published: true,
      id: { not: currentId },
      // Exclude both locale versions of the same translationGroup
      translationGroupId: { not: translationGroupId },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
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
// Category badge colors
// ---------------------------------------------------------------------------

const categoryColors: Record<PostCategory, string> = {
  architecture: "border-blue-500/25 bg-blue-500/8 text-blue-300",
  ai:           "border-violet-500/25 bg-violet-500/8 text-violet-300",
  saas:         "border-emerald-500/25 bg-emerald-500/8 text-emerald-300",
  frontend:     "border-sky-500/25 bg-sky-500/8 text-sky-300",
  backend:      "border-amber-500/25 bg-amber-500/8 text-amber-300",
  infra:        "border-orange-500/25 bg-orange-500/8 text-orange-300",
  product:      "border-pink-500/25 bg-pink-500/8 text-pink-300",
  experiment:   "border-rose-500/25 bg-rose-500/8 text-rose-300",
  deploy:       "border-cyan-500/25 bg-cyan-500/8 text-cyan-300",
  performance:  "border-yellow-500/25 bg-yellow-500/8 text-yellow-300",
};

// ---------------------------------------------------------------------------
// Prose markdown renderer
// ---------------------------------------------------------------------------

/**
 * MarkdownContent renders the post body with tasteful dark-mode prose styling.
 * No syntax highlighting library is added in this phase — code blocks render
 * with a simple monospace dark panel. Phase 5 can add shiki/prism if needed.
 */
function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose-post">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-6 mt-10 text-3xl font-black leading-tight tracking-tight text-foreground first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-4 mt-10 text-xl font-bold leading-snug text-foreground">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-3 mt-8 text-lg font-semibold text-foreground">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-5 text-[15px] leading-[1.8] text-muted-foreground">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-5 space-y-2 pl-4 text-muted-foreground">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-5 space-y-2 pl-4 text-muted-foreground list-decimal">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-[15px] leading-relaxed before:mr-2 before:text-primary before:content-['→']">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/80">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-2 border-primary/50 pl-4 text-muted-foreground/80 italic">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code className="block w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-[13px] font-mono leading-relaxed text-foreground/80 overflow-x-auto">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[13px] text-accent">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-6 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d0d14]">
              {children}
            </pre>
          ),
          hr: () => (
            <hr className="my-10 border-white/[0.07]" />
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "buildNotes" });

  const post = await getPost(locale, slug);

  // 404 if not found or not published
  if (!post || !post.published) notFound();

  const [sibling, relatedPosts] = await Promise.all([
    post.translationGroupId
      ? getSiblingPost(post.translationGroupId, locale)
      : Promise.resolve(null),
    getRelatedPosts(
      post.category as PostCategory,
      post.id,
      post.translationGroupId,
      locale
    ),
  ]);

  const catColor = categoryColors[post.category as PostCategory] ?? "border-white/15 text-muted-foreground";

  const publishedAtLabel = post.publishedAt
    ? new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(post.publishedAt))
    : null;

  // Sibling locale for the post-aware switcher
  const otherLocale = (routing.locales.find((l) => l !== locale) ?? "en") as Locale;

  const ldData = blogPostingSchema({
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    locale,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    coverImage: post.coverImage,
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <script {...jsonLdScriptProps(ldData)} />

      {/* ── Article header ────────────────────────────────────────────────── */}
      <header className="mb-12">

        {/* Top row: category badge + post-aware locale switcher */}
        {/* Design note: The in-page switcher replaces the navbar switcher for
            locale switching on post detail. The navbar switcher is still visible
            but will 404 on cross-locale navigation because post slugs differ.
            Placing a prominent switcher here is the recommended approach per spec.
            Phase 4 admin work could suppress the navbar switcher via context. */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <Badge
            variant="outline"
            className={cn("text-[10px] font-semibold uppercase tracking-wide", catColor)}
          >
            {post.category}
          </Badge>

          <PostLocaleSwitcher
            currentLocale={locale as Locale}
            siblingLocale={otherLocale}
            siblingSlug={sibling?.slug ?? null}
          />
        </div>

        {/* Title */}
        <h1 className="mb-6 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          {post.title}
        </h1>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {publishedAtLabel && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {t("publishedOn")} {publishedAtLabel}
            </span>
          )}
          {post.readingTime && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {t("readingTime", { minutes: post.readingTime })}
            </span>
          )}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="mt-10 h-px bg-gradient-to-r from-primary/20 via-white/[0.08] to-transparent" />
      </header>

      {/* ── Article body ─────────────────────────────────────────────────── */}
      <article className="mb-16">
        <MarkdownContent content={post.content} />
      </article>

      {/* ── Translation notice ───────────────────────────────────────────── */}
      {sibling && (
        <div className="mb-12 rounded-xl border border-primary/15 bg-primary/5 px-5 py-4">
          <p className="text-sm text-muted-foreground">
            {t("translatedTo")}{" "}
            <Link
              href={`/build-notes/${sibling.slug}`}
              locale={sibling.locale as Locale}
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              {t("viewIn")} {sibling.locale === "en" ? "English" : "Português"}
            </Link>
          </p>
        </div>
      )}

      {/* ── Related posts ────────────────────────────────────────────────── */}
      {relatedPosts.length > 0 && (
        <aside className="border-t border-white/[0.06] pt-12">
          <h2 className="mb-6 text-lg font-bold">{t("related")}</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {relatedPosts.map((rp) => {
              const readingTimeLabel = rp.readingTime
                ? t("readingTime", { minutes: rp.readingTime })
                : undefined;
              const publishedAtLabel = rp.publishedAt
                ? new Intl.DateTimeFormat(locale, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }).format(new Date(rp.publishedAt))
                : undefined;

              return (
                <PostCard
                  key={rp.id}
                  slug={rp.slug}
                  title={rp.title}
                  excerpt={rp.excerpt}
                  category={rp.category as PostCategory}
                  tags={rp.tags}
                  locale={locale}
                  readingTimeLabel={readingTimeLabel}
                  publishedAtLabel={publishedAtLabel}
                />
              );
            })}
          </div>
        </aside>
      )}
    </div>
  );
}
