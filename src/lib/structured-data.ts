/**
 * JSON-LD schema builders. Each returns a plain object meant to be serialized
 * into a <script type="application/ld+json"> tag by the consuming RSC page.
 *
 * We follow Google's structured-data recommendations:
 * - Person on the root layout (identity / sameAs links).
 * - WebSite on root with sitelinks search action placeholder.
 * - SoftwareApplication on each project case study.
 * - BlogPosting on each build-notes post.
 */

import { absoluteUrl, getSiteUrl } from "./site";

const SOCIAL_LINKS = [
  "https://github.com/devalexsantos",
  "https://www.linkedin.com/in/devalexsantos/",
];

export function personSchema(opts: {
  name: string;
  jobTitle: string;
  description?: string;
  locale: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: opts.name,
    url: absoluteUrl(`/${opts.locale}`),
    jobTitle: opts.jobTitle,
    description: opts.description,
    sameAs: SOCIAL_LINKS,
  };
}

export function webSiteSchema(opts: { name: string; locale: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: opts.name,
    url: absoluteUrl(`/${opts.locale}`),
    inLanguage: opts.locale,
  };
}

export function softwareApplicationSchema(opts: {
  name: string;
  description: string;
  slug: string;
  locale: string;
  category: string;
  demoUrl?: string | null;
  githubUrl?: string | null;
  coverImage?: string | null;
  year?: number | null;
}) {
  const url = absoluteUrl(`/${opts.locale}/projects/${opts.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: opts.name,
    url,
    description: opts.description,
    applicationCategory: opts.category,
    operatingSystem: "Web",
    inLanguage: opts.locale,
    image: opts.coverImage ? absoluteUrl(opts.coverImage) : undefined,
    sameAs: [opts.demoUrl, opts.githubUrl].filter(
      (v): v is string => typeof v === "string" && v.length > 0,
    ),
    datePublished: opts.year ? `${opts.year}-01-01` : undefined,
    author: { "@type": "Person", name: "Alex Santos", url: getSiteUrl() },
  };
}

export function blogPostingSchema(opts: {
  title: string;
  excerpt: string;
  slug: string;
  locale: string;
  publishedAt: Date | string | null;
  updatedAt: Date | string | null;
  coverImage?: string | null;
}) {
  const url = absoluteUrl(`/${opts.locale}/build-notes/${opts.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.title,
    description: opts.excerpt,
    url,
    mainEntityOfPage: url,
    inLanguage: opts.locale,
    image: opts.coverImage ? absoluteUrl(opts.coverImage) : undefined,
    datePublished:
      opts.publishedAt
        ? new Date(opts.publishedAt).toISOString()
        : undefined,
    dateModified:
      opts.updatedAt ? new Date(opts.updatedAt).toISOString() : undefined,
    author: { "@type": "Person", name: "Alex Santos", url: getSiteUrl() },
  };
}

/**
 * Renders a JSON-LD <script> tag. Use directly in JSX:
 *   <JsonLd data={personSchema({...})} />
 */
export function jsonLdScriptProps(data: object) {
  // Strip undefined values to keep the payload clean. Search engines tolerate
  // them but it's noise.
  function clean<T>(v: T): T {
    if (Array.isArray(v)) {
      return v.map(clean).filter((x) => x !== undefined) as unknown as T;
    }
    if (v && typeof v === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        if (val === undefined) continue;
        out[k] = clean(val);
      }
      return out as unknown as T;
    }
    return v;
  }
  return {
    type: "application/ld+json" as const,
    dangerouslySetInnerHTML: { __html: JSON.stringify(clean(data)) },
  };
}
