import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";

// ISR: 10 minutes. Project saves call revalidatePath("/[locale]/projects").
export const revalidate = 600;
import { routing } from "@/i18n/routing";
import { SectionHeader } from "@/components/ui/section-header";
import { ProjectCard } from "@/components/ui/project-card";
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
  const t = await getTranslations({ locale, namespace: "projects" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: `${t("title")} · ${tCommon("siteName")}`,
      description: t("description"),
    },
    alternates: {
      canonical: `/${locale}/projects`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/projects`])),
    },
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProjectCategory = "saas" | "ai" | "frontend" | "fullstack" | "automation" | "infra" | "experiment";
type ProjectStatus   = "draft" | "in_progress" | "shipped" | "archived";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

async function getAllProjects() {
  const projects = await prisma.project.findMany({
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
    category: p.category as ProjectCategory,
    year: p.year,
    coverImage: p.coverImage,
    demoUrl: p.demoUrl,
    githubUrl: p.githubUrl,
    featured: p.featured,
    stack: p.stack.map((s) => ({
      name: s.technology.name,
      category: s.technology.category as "frontend" | "backend" | "database" | "ai" | "devops" | "infra" | "automation" | "payments" | "email" | "testing" | "other",
    })),
  }));
}

// ---------------------------------------------------------------------------
// Filter chips config
// ---------------------------------------------------------------------------

const FILTER_KEYS = ["all", "saas", "ai", "frontend", "fullstack", "automation", "infra", "experiment", "featured"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "projects" });

  const filterOptions = FILTER_KEYS.map((key) => ({
    value: key,
    label: t(`filters.${key}`),
  }));

  let projects: Awaited<ReturnType<typeof getAllProjects>> = [];
  try {
    projects = await getAllProjects();
  } catch {
    projects = [];
  }

  // Apply filter
  const activeFilter = (category ?? "all") as FilterKey;
  const filtered = (() => {
    if (activeFilter === "all" || !FILTER_KEYS.includes(activeFilter)) return projects;
    if (activeFilter === "featured") return projects.filter((p) => p.featured);
    return projects.filter((p) => p.category === activeFilter);
  })();

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

      {/* Filter chips — wrapped in Suspense because they read searchParams client-side */}
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
          {filtered.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      )}
    </div>
  );
}
