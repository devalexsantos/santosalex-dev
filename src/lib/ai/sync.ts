/**
 * Sync layer between editorial content (Project, Post) and AiDocument rows
 * used by the RAG pipeline.
 *
 * Every Project produces 2 AiDocuments (one per locale). Every Post produces
 * 1 AiDocument (its own locale). Saving in /admin/projects or /admin/posts
 * keeps these in sync; deleting cascades.
 *
 * Each sync flips `indexed = false` so Phase 5 picks the row up.
 */

import { prisma } from "@/lib/prisma";

type Locale = "pt-BR" | "en";
const LOCALES: Locale[] = ["pt-BR", "en"];

// ---------------------------------------------------------------------------
// Content builders — flatten editorial models into markdown the LLM can chew
// ---------------------------------------------------------------------------

type Bilingual = Partial<Record<Locale, string>>;
type ContentJson = Partial<Record<Locale, Record<string, string>>>;

function pickLocale(value: unknown, locale: Locale): string {
  if (!value || typeof value !== "object") return "";
  const v = (value as Bilingual)[locale];
  return typeof v === "string" ? v.trim() : "";
}

function buildProjectContent(
  project: {
    title: string;
    shortDescription: string;
    content: unknown;
    architecture: unknown;
    challenges: unknown;
    features: { title: unknown; description: unknown; order: number }[];
    decisions: { title: unknown; description: unknown; reason: unknown; order: number }[];
    stack: { technology: { name: string; category: string } }[];
  },
  locale: Locale,
): string {
  const content = (project.content ?? {}) as ContentJson;
  const c = content[locale] ?? {};
  const arch = pickLocale(project.architecture, locale);
  const challenges = pickLocale(project.challenges, locale);

  const lines: string[] = [];

  lines.push(`# ${project.title}`);
  lines.push("");
  lines.push(project.shortDescription);
  lines.push("");

  if (c.problem) {
    lines.push(locale === "pt-BR" ? "## Problema" : "## Problem");
    lines.push(c.problem);
    lines.push("");
  }
  if (c.hypothesis) {
    lines.push(locale === "pt-BR" ? "## Hipótese" : "## Hypothesis");
    lines.push(c.hypothesis);
    lines.push("");
  }
  if (c.targetAudience) {
    lines.push(locale === "pt-BR" ? "## Público-alvo" : "## Target audience");
    lines.push(c.targetAudience);
    lines.push("");
  }
  if (arch) {
    lines.push(locale === "pt-BR" ? "## Arquitetura" : "## Architecture");
    lines.push(arch);
    lines.push("");
  }
  if (c.technicalDecisions) {
    lines.push(locale === "pt-BR" ? "## Decisões técnicas" : "## Technical decisions");
    lines.push(c.technicalDecisions);
    lines.push("");
  }
  if (challenges) {
    lines.push(locale === "pt-BR" ? "## Desafios" : "## Challenges");
    lines.push(challenges);
    lines.push("");
  }

  if (project.features.length > 0) {
    lines.push(locale === "pt-BR" ? "## Funcionalidades" : "## Features");
    const sorted = [...project.features].sort((a, b) => a.order - b.order);
    for (const f of sorted) {
      const title = pickLocale(f.title, locale);
      const desc = pickLocale(f.description, locale);
      if (title || desc) lines.push(`- **${title}**${desc ? ` — ${desc}` : ""}`);
    }
    lines.push("");
  }

  if (project.decisions.length > 0) {
    lines.push(locale === "pt-BR" ? "## Decisões" : "## Decisions");
    const sorted = [...project.decisions].sort((a, b) => a.order - b.order);
    for (const d of sorted) {
      const title = pickLocale(d.title, locale);
      const reason = pickLocale(d.reason, locale);
      const desc = pickLocale(d.description, locale);
      const parts = [title && `**${title}**`, reason, desc].filter(Boolean);
      if (parts.length > 0) lines.push(`- ${parts.join(" — ")}`);
    }
    lines.push("");
  }

  if (project.stack.length > 0) {
    lines.push(locale === "pt-BR" ? "## Stack" : "## Stack");
    lines.push(project.stack.map((s) => s.technology.name).join(", "));
    lines.push("");
  }

  if (c.learnings) {
    lines.push(locale === "pt-BR" ? "## Aprendizados" : "## Learnings");
    lines.push(c.learnings);
    lines.push("");
  }
  if (c.nextSteps) {
    lines.push(locale === "pt-BR" ? "## Próximos passos" : "## Next steps");
    lines.push(c.nextSteps);
    lines.push("");
  }

  return lines.join("\n").trim();
}

function buildPostContent(post: {
  title: string;
  excerpt: string;
  content: string;
}): string {
  return `# ${post.title}\n\n${post.excerpt}\n\n${post.content}`.trim();
}

// ---------------------------------------------------------------------------
// Public sync API
// ---------------------------------------------------------------------------

/**
 * Generates (or refreshes) the two AiDocument rows for a project — one per
 * locale. Sets indexed=false on each so the embedding pipeline re-processes.
 *
 * If a locale's content is essentially empty (no title or content), the
 * corresponding AiDocument is removed instead of stored.
 */
export async function syncProjectToAiDocuments(projectId: string): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      features: true,
      decisions: true,
      stack: { include: { technology: { select: { name: true, category: true } } } },
    },
  });

  if (!project) return;

  for (const locale of LOCALES) {
    const content = buildProjectContent(project, locale);

    // Cheap "is this locale even populated?" check: more than just the title
    const meaningful = content.split("\n").filter(Boolean).length > 2;

    if (!meaningful) {
      await prisma.aiDocument.deleteMany({
        where: { sourceType: "project", sourceId: project.id, locale },
      });
      continue;
    }

    const metadata = {
      slug: project.slug,
      category: project.category,
      status: project.status,
      year: project.year,
      featured: project.featured,
      demoUrl: project.demoUrl,
      githubUrl: project.githubUrl,
    };

    await prisma.aiDocument.upsert({
      where: {
        sourceType_sourceId_locale: {
          sourceType: "project",
          sourceId: project.id,
          locale,
        },
      },
      update: {
        title: project.title,
        content,
        metadata,
        indexed: false,
      },
      create: {
        title: project.title,
        sourceType: "project",
        sourceId: project.id,
        locale,
        content,
        metadata,
        indexed: false,
      },
    });
  }
}

/**
 * Generates (or refreshes) the AiDocument for a single Post row.
 */
export async function syncPostToAiDocument(postId: string): Promise<void> {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return;

  // Only published posts feed the public RAG. Unpublished posts get their
  // AiDocument removed so visitors can't query unreleased content.
  if (!post.published) {
    await prisma.aiDocument.deleteMany({
      where: { sourceType: "post", sourceId: post.id, locale: post.locale },
    });
    return;
  }

  const content = buildPostContent({
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
  });

  const metadata = {
    slug: post.slug,
    category: post.category,
    tags: post.tags,
    publishedAt: post.publishedAt,
    readingTime: post.readingTime,
    translationGroupId: post.translationGroupId,
  };

  await prisma.aiDocument.upsert({
    where: {
      sourceType_sourceId_locale: {
        sourceType: "post",
        sourceId: post.id,
        locale: post.locale,
      },
    },
    update: {
      title: post.title,
      content,
      metadata,
      indexed: false,
    },
    create: {
      title: post.title,
      sourceType: "post",
      sourceId: post.id,
      locale: post.locale,
      content,
      metadata,
      indexed: false,
    },
  });
}

export async function removeAiDocumentsForProject(projectId: string): Promise<void> {
  await prisma.aiDocument.deleteMany({
    where: { sourceType: "project", sourceId: projectId },
  });
}

export async function removeAiDocumentsForPost(postId: string): Promise<void> {
  await prisma.aiDocument.deleteMany({
    where: { sourceType: "post", sourceId: postId },
  });
}

/**
 * One-shot backfill: walks every project + published post and (re)generates
 * their AiDocument rows. Safe to run repeatedly.
 *
 * Returns counts so the admin UI can show what happened.
 */
export async function syncAllAiDocuments(): Promise<{
  projects: number;
  posts: number;
}> {
  const [projects, posts] = await Promise.all([
    prisma.project.findMany({ select: { id: true } }),
    prisma.post.findMany({ where: { published: true }, select: { id: true } }),
  ]);

  for (const p of projects) {
    await syncProjectToAiDocuments(p.id);
  }
  for (const p of posts) {
    await syncPostToAiDocument(p.id);
  }

  return { projects: projects.length, posts: posts.length };
}
