import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";

// ISR: 1 hour. Technology rows rarely change.
export const revalidate = 3600;
import { routing } from "@/i18n/routing";
import { SectionHeader } from "@/components/ui/section-header";
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
  const t = await getTranslations({ locale, namespace: "stack" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: `${t("title")} · ${tCommon("siteName")}`,
      description: t("description"),
    },
    alternates: {
      canonical: `/${locale}/stack`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/stack`])),
    },
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TechCategory = "frontend" | "backend" | "database" | "ai" | "devops" | "infra" | "automation" | "payments" | "email" | "testing" | "other";
type ExperienceLevel = "learning" | "intermediate" | "advanced" | "expert";

interface Tech {
  id: string;
  name: string;
  slug: string;
  category: TechCategory;
  experienceLevel: ExperienceLevel;
  description?: string | null;
}

// ---------------------------------------------------------------------------
// Visual config
// ---------------------------------------------------------------------------

const CATEGORY_ORDER: TechCategory[] = [
  "frontend", "backend", "database", "ai", "infra", "devops", "automation", "payments", "email", "testing", "other",
];

const categoryColors: Record<TechCategory, { bg: string; border: string; text: string; dot: string }> = {
  frontend:   { bg: "bg-blue-500/8",    border: "border-blue-500/15",    text: "text-blue-300",    dot: "bg-blue-400" },
  backend:    { bg: "bg-emerald-500/8", border: "border-emerald-500/15", text: "text-emerald-300", dot: "bg-emerald-400" },
  database:   { bg: "bg-amber-500/8",   border: "border-amber-500/15",   text: "text-amber-300",   dot: "bg-amber-400" },
  ai:         { bg: "bg-violet-500/8",  border: "border-violet-500/15",  text: "text-violet-300",  dot: "bg-violet-400" },
  devops:     { bg: "bg-orange-500/8",  border: "border-orange-500/15",  text: "text-orange-300",  dot: "bg-orange-400" },
  infra:      { bg: "bg-sky-500/8",     border: "border-sky-500/15",     text: "text-sky-300",     dot: "bg-sky-400" },
  automation: { bg: "bg-pink-500/8",    border: "border-pink-500/15",    text: "text-pink-300",    dot: "bg-pink-400" },
  payments:   { bg: "bg-green-500/8",   border: "border-green-500/15",   text: "text-green-300",   dot: "bg-green-400" },
  email:      { bg: "bg-rose-500/8",    border: "border-rose-500/15",    text: "text-rose-300",    dot: "bg-rose-400" },
  testing:    { bg: "bg-yellow-500/8",  border: "border-yellow-500/15",  text: "text-yellow-300",  dot: "bg-yellow-400" },
  other:      { bg: "bg-white/[0.03]",  border: "border-white/10",       text: "text-muted-foreground", dot: "bg-white/40" },
};

const levelConfig: Record<ExperienceLevel, { label: string; filled: number; color: string }> = {
  learning:     { label: "learning",     filled: 1, color: "bg-muted-foreground/50" },
  intermediate: { label: "intermediate", filled: 2, color: "bg-sky-400" },
  advanced:     { label: "advanced",     filled: 3, color: "bg-violet-400" },
  expert:       { label: "expert",       filled: 4, color: "bg-emerald-400" },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LevelDots({ level, levelLabel }: { level: ExperienceLevel; levelLabel: string }) {
  const config = levelConfig[level];
  return (
    <div className="flex items-center gap-1.5" aria-label={`Level: ${levelLabel}`} title={levelLabel}>
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full transition-colors",
            i <= config.filled ? config.color : "bg-white/15",
          )}
        />
      ))}
    </div>
  );
}

function TechCard({ tech, levelLabel }: { tech: Tech; levelLabel: string }) {
  const colors = categoryColors[tech.category];
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border px-4 py-3",
        "transition-all duration-200",
        "hover:bg-white/[0.04]",
        colors.bg,
        colors.border,
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className={cn("h-2 w-2 shrink-0 rounded-full", colors.dot)} aria-hidden />
        <span className={cn("text-sm font-medium truncate", colors.text)}>{tech.name}</span>
      </div>
      <LevelDots level={tech.experienceLevel} levelLabel={levelLabel} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

async function getTechnologies() {
  const techs = await prisma.technology.findMany({
    orderBy: { name: "asc" },
  });
  return techs as Tech[];
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function StackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "stack" });

  let technologies: Tech[] = [];
  try {
    technologies = await getTechnologies();
  } catch {
    technologies = [];
  }

  // Group by category
  const grouped = CATEGORY_ORDER.reduce<Record<TechCategory, Tech[]>>((acc, cat) => {
    acc[cat] = technologies.filter((t) => t.category === cat);
    return acc;
  }, {} as Record<TechCategory, Tech[]>);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      {/* Hero */}
      <SectionHeader
        as="h1"
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        align="center"
        titleGradient
        className="mb-16"
      />

      {/* Legend */}
      <div className="mb-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {(["learning", "intermediate", "advanced", "expert"] as ExperienceLevel[]).map((level) => {
          const cfg = levelConfig[level];
          return (
            <div key={level} className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={cn("h-1.5 w-1.5 rounded-full", i <= cfg.filled ? cfg.color : "bg-white/15")}
                  />
                ))}
              </div>
              <span className="capitalize">{t(`levels.${level}`)}</span>
            </div>
          );
        })}
      </div>

      {/* Categories */}
      <div className="space-y-12">
        {CATEGORY_ORDER.map((cat) => {
          const techs = grouped[cat];
          if (!techs || techs.length === 0) return null;
          const colors = categoryColors[cat];
          return (
            <section key={cat}>
              {/* Category heading */}
              <div className="mb-4 flex items-center gap-3">
                <span className={cn("h-3 w-3 rounded-full", colors.dot)} aria-hidden />
                <h2 className={cn("text-xs font-semibold uppercase tracking-widest", colors.text)}>
                  {t(`categories.${cat}`)}
                </h2>
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-muted-foreground/50">{techs.length}</span>
              </div>

              {/* Tech cards grid */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {techs.map((tech) => (
                  <TechCard
                    key={tech.id}
                    tech={tech}
                    levelLabel={t(`levels.${tech.experienceLevel}`)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
