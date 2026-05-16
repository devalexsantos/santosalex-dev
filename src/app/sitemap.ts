import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";
import { routing } from "@/i18n/routing";

const STATIC_ROUTES = [
  { path: "",              priority: 1.0,  changeFrequency: "weekly"  as const },
  { path: "/about",        priority: 0.8,  changeFrequency: "monthly" as const },
  { path: "/projects",     priority: 0.9,  changeFrequency: "weekly"  as const },
  { path: "/build-notes",  priority: 0.8,  changeFrequency: "weekly"  as const },
  { path: "/stack",        priority: 0.6,  changeFrequency: "monthly" as const },
  { path: "/how-i-build",  priority: 0.6,  changeFrequency: "monthly" as const },
  { path: "/recruiter",    priority: 0.7,  changeFrequency: "monthly" as const },
  { path: "/contact",      priority: 0.5,  changeFrequency: "yearly"  as const },
];

/**
 * Build a per-locale URL with its sibling locale exposed via the `alternates`
 * field so search engines render hreflang annotations from the sitemap.
 */
function localizedEntry(
  siteUrl: string,
  path: string,
  lastModified: Date,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
): MetadataRoute.Sitemap {
  return routing.locales.map((locale) => ({
    url: `${siteUrl}/${locale}${path}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${siteUrl}/${l}${path}`]),
      ),
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  // Static pages
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.flatMap((r) =>
    localizedEntry(siteUrl, r.path, now, r.changeFrequency, r.priority),
  );

  // Dynamic content. Wrap in try/catch so a DB outage during the crawler hit
  // doesn't make the whole sitemap fail.
  let dynamicEntries: MetadataRoute.Sitemap = [];

  try {
    const [projects, posts] = await Promise.all([
      prisma.project.findMany({
        where: { status: { not: "draft" } },
        select: { slug: true, updatedAt: true },
      }),
      // Posts are per-locale rows; only published ones go in the sitemap.
      // translationGroupId lets us pair PT/EN siblings even when their slugs
      // differ (they almost always do — slugs are translated too).
      prisma.post.findMany({
        where: { published: true },
        select: { slug: true, locale: true, updatedAt: true, translationGroupId: true },
      }),
    ]);

    // Project: single slug shared across both locales.
    const projectEntries = projects.flatMap((p) =>
      localizedEntry(siteUrl, `/projects/${p.slug}`, p.updatedAt, "monthly", 0.7),
    );

    // Post: one row per locale. Group by translationGroupId so PT/EN siblings
    // (which have different slugs) get listed as proper hreflang alternates.
    type SiblingMap = Map<string, { slug: string; updatedAt: Date }>;
    const postsByGroup = new Map<string, SiblingMap>();
    for (const p of posts) {
      if (!postsByGroup.has(p.translationGroupId)) {
        postsByGroup.set(p.translationGroupId, new Map());
      }
      postsByGroup.get(p.translationGroupId)!.set(p.locale, {
        slug: p.slug,
        updatedAt: p.updatedAt,
      });
    }

    const postEntries: MetadataRoute.Sitemap = [];
    for (const siblings of postsByGroup.values()) {
      const alternates = Object.fromEntries(
        Array.from(siblings.entries()).map(([l, { slug }]) => [
          l,
          `${siteUrl}/${l}/build-notes/${slug}`,
        ]),
      );
      for (const [locale, { slug, updatedAt }] of siblings.entries()) {
        postEntries.push({
          url: `${siteUrl}/${locale}/build-notes/${slug}`,
          lastModified: updatedAt,
          changeFrequency: "monthly",
          priority: 0.6,
          alternates: { languages: alternates },
        });
      }
    }

    dynamicEntries = [...projectEntries, ...postEntries];
  } catch (err) {
    console.error("[sitemap] dynamic entries failed:", err);
  }

  return [...staticEntries, ...dynamicEntries];
}
