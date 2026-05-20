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
    readme: unknown;
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
  const readme = pickLocale(project.readme, locale);

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

  if (readme) {
    lines.push(locale === "pt-BR" ? "## README — detalhamento técnico" : "## README — technical deep dive");
    lines.push(readme);
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
      categories: project.categories,
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

// ---------------------------------------------------------------------------
// Profile sync
// ---------------------------------------------------------------------------

type ProfileRow = {
  id: string;
  tagline: unknown;
  bio: unknown;
  approach: unknown;
  location: string | null;
  availability: string | null;
};

type RoleRow = {
  id: string;
  title: unknown;
  description: unknown;
  order: number;
};

type ExperienceRow = {
  id: string;
  company: string;
  role: unknown;
  period: string;
  highlights: unknown;
  order: number;
};

type FaqRow = {
  id: string;
  question: unknown;
  answer: unknown;
  order: number;
};

type AiDocumentSpec = {
  title: string;
  sourceType: "profile" | "experience" | "faq";
  sourceId: string | null;
  locale: Locale;
  content: string;
};

/**
 * Builds the set of AiDocument specs for one locale from all profile data.
 * - 1 root "Perfil" doc (sourceType=profile, sourceId=null)
 * - 1 doc per role (sourceType=experience, sourceId=role.id)
 * - 1 doc per experience (sourceType=experience, sourceId=experience.id)
 * - 1 doc per faq (sourceType=faq, sourceId=faq.id)
 */
export function buildProfileDocs(
  profile: ProfileRow,
  roles: RoleRow[],
  experiences: ExperienceRow[],
  faqs: FaqRow[],
  locale: Locale,
): AiDocumentSpec[] {
  const docs: AiDocumentSpec[] = [];

  // ── Root profile document ──
  const tagline = pickLocale(profile.tagline, locale);
  const bio = pickLocale(profile.bio, locale);
  const approach = pickLocale(profile.approach, locale);

  const profileLines: string[] = [];
  profileLines.push(
    locale === "pt-BR" ? "# Perfil — Alex Santos" : "# Profile — Alex Santos",
  );
  profileLines.push("");
  if (tagline) {
    profileLines.push(locale === "pt-BR" ? "## Tagline" : "## Tagline");
    profileLines.push(tagline);
    profileLines.push("");
  }
  if (bio) {
    profileLines.push(locale === "pt-BR" ? "## Sobre" : "## About");
    profileLines.push(bio);
    profileLines.push("");
  }
  if (approach) {
    profileLines.push(
      locale === "pt-BR" ? "## Como trabalho" : "## How I work",
    );
    profileLines.push(approach);
    profileLines.push("");
  }
  if (profile.location) {
    profileLines.push(
      locale === "pt-BR" ? `**Localização:** ${profile.location}` : `**Location:** ${profile.location}`,
    );
    profileLines.push("");
  }
  if (profile.availability) {
    profileLines.push(
      locale === "pt-BR" ? `**Disponibilidade:** ${profile.availability}` : `**Availability:** ${profile.availability}`,
    );
    profileLines.push("");
  }

  docs.push({
    title: locale === "pt-BR" ? "Perfil — Alex Santos" : "Profile — Alex Santos",
    sourceType: "profile",
    sourceId: null,
    locale,
    content: profileLines.join("\n").trim(),
  });

  // ── Role type documents ──
  for (const role of roles) {
    const title = pickLocale(role.title, locale);
    const description = pickLocale(role.description, locale);
    if (!title && !description) continue;

    const lines: string[] = [];
    lines.push(`# ${title || "Tipo de vaga"}`);
    if (description) {
      lines.push("");
      lines.push(description);
    }

    docs.push({
      title: title || "Tipo de vaga",
      sourceType: "experience",
      sourceId: role.id,
      locale,
      content: lines.join("\n").trim(),
    });
  }

  // ── Experience documents ──
  for (const exp of experiences) {
    const roleTitle = pickLocale(exp.role, locale);
    const highlights = pickLocale(exp.highlights, locale);
    const docTitle = `${exp.company}${roleTitle ? ` — ${roleTitle}` : ""}`;

    const lines: string[] = [];
    lines.push(`# ${docTitle}`);
    if (exp.period) {
      lines.push("");
      lines.push(
        locale === "pt-BR" ? `**Período:** ${exp.period}` : `**Period:** ${exp.period}`,
      );
    }
    if (highlights) {
      lines.push("");
      lines.push(locale === "pt-BR" ? "## Destaques" : "## Highlights");
      lines.push(highlights);
    }

    docs.push({
      title: docTitle,
      sourceType: "experience",
      sourceId: exp.id,
      locale,
      content: lines.join("\n").trim(),
    });
  }

  // ── FAQ documents ──
  for (const faq of faqs) {
    const question = pickLocale(faq.question, locale);
    const answer = pickLocale(faq.answer, locale);
    if (!question && !answer) continue;

    const lines: string[] = [];
    lines.push(`# FAQ: ${question}`);
    lines.push("");
    lines.push(
      locale === "pt-BR" ? `**Pergunta:** ${question}` : `**Question:** ${question}`,
    );
    lines.push(
      locale === "pt-BR" ? `**Resposta:** ${answer}` : `**Answer:** ${answer}`,
    );

    docs.push({
      title: `FAQ: ${question}`,
      sourceType: "faq",
      sourceId: faq.id,
      locale,
      content: lines.join("\n").trim(),
    });
  }

  return docs;
}

/**
 * Full rebuild of all AiDocument rows for profile data (both locales).
 *
 * Strategy:
 * 1. Load all profile data from DB.
 * 2. Compute the desired set of (sourceType, sourceId, locale) tuples.
 * 3. Delete orphaned AiDocument rows (roles/experiences/faqs that were removed).
 * 4. Upsert the rest (all land with indexed=false for re-embedding).
 *
 * NOTE: This function only touches sourceType in {profile, experience, faq}.
 * It never modifies project or post documents.
 */
export async function syncProfileToAiDocuments(): Promise<{
  deleted: number;
  upserted: number;
}> {
  // Load all profile data
  const [profile, roles, experiences, faqs] = await Promise.all([
    prisma.profile.findUnique({ where: { id: "singleton" } }),
    prisma.profileRoleType.findMany({ orderBy: { order: "asc" } }),
    prisma.profileExperience.findMany({ orderBy: { order: "asc" } }),
    prisma.profileFaq.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!profile) {
    return { deleted: 0, upserted: 0 };
  }

  // Build the desired set of docs for both locales
  const desiredDocs: AiDocumentSpec[] = [];
  for (const locale of LOCALES) {
    const docs = buildProfileDocs(profile, roles, experiences, faqs, locale);
    desiredDocs.push(...docs);
  }

  // Collect all sourceIds that should exist (for experience + faq types)
  // Note: profile docs have sourceId=null — handled separately
  const desiredExperienceIds = new Set(
    desiredDocs
      .filter((d) => d.sourceType === "experience")
      .map((d) => d.sourceId)
      .filter((id): id is string => id !== null),
  );
  const desiredFaqIds = new Set(
    desiredDocs
      .filter((d) => d.sourceType === "faq")
      .map((d) => d.sourceId)
      .filter((id): id is string => id !== null),
  );

  // Find all existing profile-managed AiDocument rows
  const existing = await prisma.aiDocument.findMany({
    where: {
      sourceType: { in: ["profile", "experience", "faq"] },
    },
    select: { id: true, sourceType: true, sourceId: true, locale: true },
  });

  // Determine orphans: rows whose sourceId is no longer in the desired set
  const orphanIds = existing
    .filter((row) => {
      if (row.sourceType === "profile") return false; // never orphan the root profile doc
      if (row.sourceType === "experience") {
        return row.sourceId !== null && !desiredExperienceIds.has(row.sourceId);
      }
      if (row.sourceType === "faq") {
        return row.sourceId !== null && !desiredFaqIds.has(row.sourceId);
      }
      return false;
    })
    .map((row) => row.id);

  let deleted = 0;
  if (orphanIds.length > 0) {
    const result = await prisma.aiDocument.deleteMany({
      where: { id: { in: orphanIds } },
    });
    deleted = result.count;
  }

  // Upsert all desired docs
  let upserted = 0;
  for (const doc of desiredDocs) {
    // AiDocument has @@unique([sourceType, sourceId, locale])
    // sourceId is null for the root profile doc — Prisma requires a special
    // workaround for null in unique constraints. We handle it with a
    // findFirst + create/update pattern (same as the Prisma 7 compound upsert fix).
    const existing = await prisma.aiDocument.findFirst({
      where: {
        sourceType: doc.sourceType,
        sourceId: doc.sourceId,
        locale: doc.locale,
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.aiDocument.update({
        where: { id: existing.id },
        data: {
          title: doc.title,
          content: doc.content,
          indexed: false,
        },
      });
    } else {
      await prisma.aiDocument.create({
        data: {
          title: doc.title,
          sourceType: doc.sourceType,
          sourceId: doc.sourceId,
          locale: doc.locale,
          content: doc.content,
          indexed: false,
        },
      });
    }
    upserted++;
  }

  return { deleted, upserted };
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
