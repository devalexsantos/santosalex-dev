import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExternalLink, Sparkles } from "lucide-react";

// Inline SVG for GitHub — lucide-react v1 removed social icons
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
import { prisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { SectionHeader } from "@/components/ui/section-header";
import { GlowCard } from "@/components/ui/glow-card";
import { StackBadge } from "@/components/ui/stack-badge";
import { Badge } from "@/components/ui/badge";
import { ProjectCard } from "@/components/ui/project-card";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProjectStatus = "draft" | "in_progress" | "shipped" | "archived";
type ProjectCategory = "saas" | "ai" | "frontend" | "fullstack" | "automation" | "infra" | "experiment";
type TechCategory = "frontend" | "backend" | "database" | "ai" | "devops" | "infra" | "automation" | "payments" | "email" | "testing" | "other";

interface LocaleContent {
  problem?: string;
  hypothesis?: string;
  targetAudience?: string;
  technicalDecisions?: string;
  learnings?: string;
  nextSteps?: string;
  fullDescription?: string;
}

/** Bilingual JSON field shape: { "pt-BR": string, "en": string } */
type BilingualJson = Record<string, string>;

// ---------------------------------------------------------------------------
// Static params
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const projects = await prisma.project.findMany({ select: { slug: true } });
  return routing.locales.flatMap((locale) =>
    projects.map((p) => ({ locale, slug: p.slug }))
  );
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
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) return {};

  const content = (project.content as Record<string, LocaleContent> | null) ?? {};
  const localeContent: LocaleContent = content[locale] ?? content["pt-BR"] ?? {};
  const description =
    localeContent.problem?.slice(0, 160) ?? project.shortDescription;

  return {
    title: project.title,
    description,
    openGraph: {
      title: project.title,
      description,
    },
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/projects/${slug}`])
      ),
    },
  };
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function getProject(slug: string) {
  return prisma.project.findUnique({
    where: { slug },
    include: {
      stack: { include: { technology: true } },
      features: { orderBy: { order: "asc" } },
      decisions: { orderBy: { order: "asc" } },
    },
  });
}

async function getRelatedProjects(currentSlug: string) {
  return prisma.project.findMany({
    where: { slug: { not: currentSlug } },
    orderBy: [{ order: "asc" }],
    take: 3,
    include: {
      stack: { include: { technology: { select: { name: true, category: true } } } },
    },
  });
}

// ---------------------------------------------------------------------------
// Visual config (mirrors project-card status config)
// ---------------------------------------------------------------------------

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  draft:       { label: "Draft",       className: "border-white/15 text-muted-foreground" },
  in_progress: { label: "In Progress", className: "border-amber-500/30 text-amber-400 bg-amber-500/10" },
  shipped:     { label: "Shipped",     className: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" },
  archived:    { label: "Archived",    className: "border-white/15 text-muted-foreground" },
};

const categoryLabels: Record<ProjectCategory, string> = {
  saas:       "SaaS",
  ai:         "AI",
  frontend:   "Frontend",
  fullstack:  "Fullstack",
  automation: "Automation",
  infra:      "Infra",
  experiment: "Experiment",
};

// ---------------------------------------------------------------------------
// Small prose component — renders plain strings as styled paragraphs.
// No markdown library needed for project content (all plain text).
// ---------------------------------------------------------------------------

function ProseText({ text, className }: { text: string; className?: string }) {
  // Split on double newlines to create paragraphs
  const paragraphs = text.split(/\n{2,}/).filter(Boolean);
  return (
    <div className={cn("space-y-4", className)}>
      {paragraphs.map((para, i) => (
        <p
          key={i}
          className="text-[15px] leading-relaxed text-muted-foreground"
        >
          {para.trim()}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper — renders heading + children only when there is content
// ---------------------------------------------------------------------------

function CaseSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("scroll-mt-20", className)}>
      <div className="mb-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/[0.06]" />
        <h2 className="shrink-0 text-xs font-semibold uppercase tracking-widest text-primary/70">
          {title}
        </h2>
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "caseStudy" });

  const [project, relatedProjects] = await Promise.all([
    getProject(slug),
    getRelatedProjects(slug),
  ]);

  if (!project) notFound();

  const content = (project.content as Record<string, LocaleContent> | null) ?? {};
  const c: LocaleContent = content[locale] ?? content["pt-BR"] ?? {};

  const statusStyle = statusConfig[project.status as ProjectStatus];
  const categoryLabel = categoryLabels[project.category as ProjectCategory] ?? project.category;

  // Determine if we should render AI section:
  // - project.category is "ai", OR
  // - project has any tech with category "ai"
  const hasAiStack = project.stack.some((s) => s.technology.category === "ai");
  const showAiSection = project.category === "ai" || hasAiStack;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">

      {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
      <header className="mb-16">
        {/* Cover placeholder — gradient block with initials when no coverImage */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-white/[0.07]">
          {project.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.coverImage}
              alt={project.title}
              className="h-56 w-full object-cover sm:h-72"
            />
          ) : (
            <div className="flex h-48 items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/10 sm:h-64">
              <span className="text-5xl font-black tracking-tight text-white/20 select-none">
                {project.title
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 3)
                  .toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn("text-[10px] font-semibold uppercase tracking-wide", statusStyle.className)}
          >
            {statusStyle.label}
          </Badge>
          <Badge
            variant="outline"
            className="border-primary/20 bg-primary/8 text-[10px] font-semibold uppercase tracking-wide text-primary"
          >
            {categoryLabel}
          </Badge>
          {project.year && (
            <span className="text-xs text-muted-foreground">{project.year}</span>
          )}
        </div>

        {/* Title */}
        <h1 className="mb-3 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
          {project.title}
        </h1>

        {/* Short description lead */}
        <p className="text-lg leading-relaxed text-muted-foreground">
          {project.shortDescription}
        </p>
      </header>

      {/* ── Article body ─────────────────────────────────────────────────── */}
      <div className="space-y-14">

        {/* ── 2. Visão geral ──────────────────────────────────────────────── */}
        {(c.problem || c.fullDescription) && (
          <CaseSection title={t("sections.overview")}>
            <ProseText text={c.fullDescription ?? c.problem ?? ""} />
          </CaseSection>
        )}

        {/* ── 3. Problema ─────────────────────────────────────────────────── */}
        {c.problem && (
          <CaseSection title={t("sections.problem")}>
            <GlowCard noHover className="p-6">
              <ProseText text={c.problem} />
            </GlowCard>
          </CaseSection>
        )}

        {/* ── 4. Hipótese ─────────────────────────────────────────────────── */}
        {c.hypothesis && (
          <CaseSection title={t("sections.hypothesis")}>
            <div className="rounded-2xl border border-primary/15 bg-primary/5 p-6">
              <ProseText text={c.hypothesis} />
            </div>
          </CaseSection>
        )}

        {/* ── 5. Público-alvo ─────────────────────────────────────────────── */}
        {c.targetAudience && (
          <CaseSection title={t("sections.targetAudience")}>
            <ProseText text={c.targetAudience} />
          </CaseSection>
        )}

        {/* ── 6. Stack utilizada ──────────────────────────────────────────── */}
        {project.stack.length > 0 && (
          <CaseSection title={t("sections.stack")}>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((s) => (
                <StackBadge
                  key={s.id}
                  name={s.technology.name}
                  category={s.technology.category as TechCategory}
                />
              ))}
            </div>
          </CaseSection>
        )}

        {/* ── 7. Arquitetura ──────────────────────────────────────────────── */}
        {/* Architecture comes from Project.architecture[locale] — a dedicated
            bilingual JSON field added in Phase 4 schema refactor.
            Falls back to technicalDecisions content when architecture is empty. */}
        {(() => {
          const arch = (project.architecture as BilingualJson | null);
          const archText = arch?.[locale] ?? arch?.["pt-BR"] ?? c.technicalDecisions ?? "";
          return archText ? (
            <CaseSection title={t("sections.architecture")}>
              <ProseText text={archText} />
            </CaseSection>
          ) : null;
        })()}

        {/* ── 8. Decisões técnicas ────────────────────────────────────────── */}
        {project.decisions.length > 0 && (
          <CaseSection title={t("sections.decisions")}>
            <div className="space-y-4">
              {project.decisions.map((d) => {
                // title, description, reason are bilingual JSON: { "pt-BR": string, "en": string }
                const decTitle = (d.title as BilingualJson)[locale] ?? (d.title as BilingualJson)["pt-BR"] ?? "";
                const decDesc  = (d.description as BilingualJson)[locale] ?? (d.description as BilingualJson)["pt-BR"] ?? "";
                const decReason = (d.reason as BilingualJson)[locale] ?? (d.reason as BilingualJson)["pt-BR"] ?? "";
                return (
                  <GlowCard key={d.id} noHover className="p-5">
                    <h3 className="mb-1 text-sm font-semibold text-foreground">
                      {decTitle}
                    </h3>
                    <p className="mb-3 text-xs font-medium text-primary/80">
                      {decReason}
                    </p>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">
                      {decDesc}
                    </p>
                  </GlowCard>
                );
              })}
            </div>
          </CaseSection>
        )}

        {/* ── 9. Funcionalidades ──────────────────────────────────────────── */}
        {project.features.length > 0 && (
          <CaseSection title={t("sections.features")}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.features.map((f) => {
                // title and description are bilingual JSON: { "pt-BR": string, "en": string }
                const featureTitle = (f.title as BilingualJson)[locale] ?? (f.title as BilingualJson)["pt-BR"] ?? "";
                const featureDesc  = (f.description as BilingualJson)[locale] ?? (f.description as BilingualJson)["pt-BR"] ?? "";
                return (
                  <div
                    key={f.id}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition-colors hover:border-primary/20 hover:bg-primary/5"
                  >
                    <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <span className="text-xs font-bold">{f.order}</span>
                    </div>
                    <h3 className="mb-1.5 text-sm font-semibold leading-snug">
                      {featureTitle}
                    </h3>
                    <p className="text-[12px] leading-relaxed text-muted-foreground">
                      {featureDesc}
                    </p>
                  </div>
                );
              })}
            </div>
          </CaseSection>
        )}

        {/* ── 10. Desafios ────────────────────────────────────────────────── */}
        {/* Project.challenges is a bilingual JSON field: { "pt-BR": string, "en": string }
            Added in Phase 4 schema refactor. Renders only when the field is populated. */}
        {(() => {
          const ch = (project.challenges as BilingualJson | null);
          const chText = ch?.[locale] ?? ch?.["pt-BR"] ?? "";
          return chText ? (
            <CaseSection title={t("sections.challenges")}>
              <ProseText text={chText} />
            </CaseSection>
          ) : null;
        })()}

        {/* ── 11. Como a IA entra no projeto ──────────────────────────────── */}
        {showAiSection && c.technicalDecisions && (
          <CaseSection title={t("sections.aiRole")}>
            <div className="flex items-start gap-4 rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-6">
              <div className="shrink-0 rounded-xl bg-violet-500/20 p-2.5">
                <Sparkles className="h-5 w-5 text-violet-300" />
              </div>
              <ProseText text={c.technicalDecisions} />
            </div>
          </CaseSection>
        )}

        {/* ── 12. Demos ───────────────────────────────────────────────────── */}
        {(project.demoUrl || project.githubUrl) && (
          <CaseSection title={t("sections.demos")}>
            <div className="flex flex-wrap gap-3">
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t("sections.viewDemo")}
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-white/[0.08]"
                >
                  <GithubIcon className="h-4 w-4" />
                  {t("sections.viewSource")}
                </a>
              )}
            </div>
          </CaseSection>
        )}

        {/* ── 13. Resultados e aprendizados ───────────────────────────────── */}
        {c.learnings && (
          <CaseSection title={t("sections.learnings")}>
            <ProseText text={c.learnings} />
          </CaseSection>
        )}

        {/* ── 14. Próximos passos ─────────────────────────────────────────── */}
        {c.nextSteps && (
          <CaseSection title={t("sections.nextSteps")}>
            <ProseText text={c.nextSteps} />
          </CaseSection>
        )}

        {/* ── 15. Ask the AI (Phase 5 placeholder) ────────────────────────── */}
        {/* NOTE: This section is a placeholder. Phase 5 will wire lib/ai/rag.ts
            into this component — the RAG pipeline will scope the query to this
            project's chunks only (filtered by sourceId = project.id). */}
        <CaseSection title={t("sections.askAi", { projectTitle: project.title })}>
          <GlowCard noHover glowColor="primary" className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-primary/20 p-2.5">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {t("sections.askAi", { projectTitle: project.title })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("sections.askAiSoon")}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
              <p className="text-sm text-muted-foreground/60">
                {t("sections.askAiPlaceholder")}
              </p>
            </div>
          </GlowCard>
        </CaseSection>

      </div>

      {/* ── Related projects ─────────────────────────────────────────────── */}
      {relatedProjects.length > 0 && (
        <aside className="mt-24 border-t border-white/[0.06] pt-16">
          <SectionHeader
            eyebrow={t("sections.relatedProjects")}
            title={t("sections.relatedProjects")}
            align="start"
            className="mb-8"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProjects.map((p) => (
              <ProjectCard
                key={p.id}
                slug={p.slug}
                title={p.title}
                shortDescription={p.shortDescription}
                status={p.status as ProjectStatus}
                category={p.category as ProjectCategory}
                year={p.year}
                demoUrl={p.demoUrl}
                githubUrl={p.githubUrl}
                stack={p.stack.map((s) => ({
                  name: s.technology.name,
                  category: s.technology.category as TechCategory,
                }))}
              />
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
