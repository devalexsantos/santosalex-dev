import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/ui/section-header";
import { StackBadge } from "@/components/ui/stack-badge";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "experiments" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: `${t("title")} · ${tCommon("siteName")}`,
      description: t("description"),
    },
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProjectStatus = "draft" | "in_progress" | "shipped" | "archived";

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  draft:       { label: "Draft",       className: "border-white/15 text-muted-foreground" },
  in_progress: { label: "In Progress", className: "border-amber-500/30 text-amber-400 bg-amber-500/10" },
  shipped:     { label: "Shipped",     className: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" },
  archived:    { label: "Archived",    className: "border-white/15 text-muted-foreground" },
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

async function getExperiments() {
  const projects = await prisma.project.findMany({
    where: { category: "experiment" },
    orderBy: [{ order: "asc" }, { year: "desc" }],
    include: {
      stack: {
        include: {
          technology: { select: { name: true, category: true } },
        },
      },
    },
  });

  return projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    shortDescription: p.shortDescription,
    status: p.status as ProjectStatus,
    year: p.year,
    demoUrl: p.demoUrl,
    githubUrl: p.githubUrl,
    stack: p.stack.map((s) => ({
      name: s.technology.name,
      category: s.technology.category as "frontend" | "backend" | "database" | "ai" | "devops" | "infra" | "automation" | "payments" | "email" | "testing" | "other",
    })),
  }));
}

// ---------------------------------------------------------------------------
// Beaker icon (inline — no social icons dep issues)
// ---------------------------------------------------------------------------

function BeakerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 3h6M9 3v7l-4.5 8.5A1 1 0 0 0 5.4 20h13.2a1 1 0 0 0 .9-1.5L15 10V3" />
      <path d="M7.5 15h9" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Experiment card
// ---------------------------------------------------------------------------

function ExperimentCard({
  slug,
  title,
  shortDescription,
  status,
  year,
  stack,
  markerLabel,
}: {
  slug: string;
  title: string;
  shortDescription: string;
  status: ProjectStatus;
  year?: number | null;
  stack: { name: string; category: string }[];
  markerLabel: string;
}) {
  const statusStyle = statusConfig[status];

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-2xl",
        "border border-white/[0.07] bg-white/[0.025]",
        "p-5 backdrop-blur-sm",
        "transition-all duration-300",
        "hover:border-pink-500/25",
        "hover:shadow-[0_0_0_1px_rgba(236,72,153,0.15),0_0_30px_rgba(236,72,153,0.08)]",
      )}
    >
      {/* Lab marker */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 rounded-full border border-pink-500/25 bg-pink-500/10 px-2.5 py-1">
          <BeakerIcon className="h-3 w-3 text-pink-400" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-pink-400">
            {markerLabel}
          </span>
        </div>
        <Badge
          variant="outline"
          className={cn("text-[10px] font-semibold uppercase tracking-wide", statusStyle.className)}
        >
          {statusStyle.label}
        </Badge>
      </div>

      {/* Title + description */}
      <div className="flex-1">
        <Link href={`/projects/${slug}`}>
          <h3 className="mb-1.5 text-base font-semibold leading-snug transition-colors group-hover:text-pink-300">
            {title}
          </h3>
        </Link>
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {shortDescription}
        </p>
      </div>

      {/* Footer: year + stack */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {year && <span className="text-xs text-muted-foreground/60">{year}</span>}
        <div className="flex flex-wrap gap-1.5">
          {stack.slice(0, 3).map((t) => (
            <StackBadge
              key={t.name}
              name={t.name}
              category={t.category as "frontend" | "backend" | "database" | "ai" | "devops" | "infra" | "automation" | "payments" | "email" | "testing" | "other"}
            />
          ))}
          {stack.length > 3 && (
            <span className="inline-flex items-center rounded-full border border-white/10 px-2 py-0.5 text-xs text-muted-foreground">
              +{stack.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Hover accent top bar */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </article>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ExperimentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "experiments" });

  let experiments: Awaited<ReturnType<typeof getExperiments>> = [];
  try {
    experiments = await getExperiments();
  } catch {
    experiments = [];
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      {/* Hero */}
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        align="center"
        titleGradient
        className="mb-16"
      />

      {/* Experiments masonry-ish grid */}
      {experiments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BeakerIcon className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">No experiments yet.</p>
        </div>
      ) : (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {experiments.map((exp, i) => (
            <div key={exp.id} className="mb-5 break-inside-avoid">
              <ExperimentCard
                {...exp}
                markerLabel={t("marker")}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
