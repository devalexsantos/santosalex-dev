import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";
import { HeroSection } from "@/components/home/hero-section";
import { BentoSection } from "@/components/home/bento-section";
import { FeaturedProjectsSection } from "@/components/home/featured-projects-section";
import { AnimatedGridBackgroundLazy } from "@/components/animations/animated-grid-background-lazy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const title = `${t("title")} ${t("titleAccent")}`;
  return {
    title: { absolute: `${tCommon("siteName")} — ${t("eyebrow")}` },
    description: t("subtitle"),
    openGraph: {
      title: tCommon("siteName"),
      description: title,
    },
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
    },
  };
}

type Bilingual = { "pt-BR"?: string; en?: string };

function pickLocalized(field: unknown, locale: string): string | null {
  if (!field || typeof field !== "object") return null;
  const f = field as Bilingual;
  return f[locale as keyof Bilingual] ?? f["pt-BR"] ?? f.en ?? null;
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // ── Fetch featured projects from DB ──────────────────────
  // Gracefully handle DB unavailability during build/dev
  let featuredProjects: Awaited<ReturnType<typeof getFeaturedProjects>> = [];
  try {
    featuredProjects = await getFeaturedProjects();
  } catch {
    // DB not available (build time, no DB, etc.) — render without projects
    featuredProjects = [];
  }

  // ── Profile-driven hero copy (admin can edit without redeploy) ─
  let profileTagline: string | null = null;
  let profileAvailability: string | null = null;
  try {
    const profile = await prisma.profile.findUnique({ where: { id: "singleton" } });
    if (profile) {
      profileTagline = pickLocalized(profile.tagline, locale);
      profileAvailability = profile.availability ?? null;
    }
  } catch {
    // Profile not seeded / DB down — hero falls back to i18n strings
  }

  const firstFeatured = featuredProjects[0] ?? null;

  return (
    <>
      {/* Decorative animated grid background */}
      <AnimatedGridBackgroundLazy />

      {/* Hero */}
      <HeroSection
        taglineOverride={profileTagline}
        availabilityOverride={profileAvailability}
      />

      {/* Bento grid overview */}
      <BentoSection
        featuredProject={
          firstFeatured
            ? {
                title: firstFeatured.title,
                shortDescription: firstFeatured.shortDescription,
                slug: firstFeatured.slug,
                category: firstFeatured.category,
                status: firstFeatured.status,
              }
            : null
        }
      />

      {/* Featured projects */}
      <FeaturedProjectsSection projects={featuredProjects} />
    </>
  );
}

// ── Data fetching ─────────────────────────────────────────

async function getFeaturedProjects() {
  const projects = await prisma.project.findMany({
    where: { featured: true },
    orderBy: { order: "asc" },
    take: 6,
    include: {
      stack: {
        include: {
          technology: {
            select: { name: true, category: true },
          },
        },
      },
    },
  });

  return projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    shortDescription: p.shortDescription,
    status: p.status as "draft" | "in_progress" | "shipped" | "archived",
    category: p.category as "saas" | "ai" | "frontend" | "fullstack" | "automation" | "infra" | "experiment",
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
