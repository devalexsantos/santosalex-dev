import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin, Sparkles, ChevronDown } from "lucide-react";
import { prisma } from "@/lib/prisma";

// ISR: 10 minutes. Profile edits trigger revalidatePath on save.
export const revalidate = 600;
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { SectionHeader } from "@/components/ui/section-header";
import { GradientText } from "@/components/ui/gradient-text";
import { cn } from "@/lib/utils";

type Bilingual = { "pt-BR"?: string; en?: string };

function pick(field: unknown, locale: string): string {
  if (!field || typeof field !== "object") return "";
  const f = field as Bilingual;
  return f[locale as keyof Bilingual] ?? f["pt-BR"] ?? f.en ?? "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: `${t("title")} · ${tCommon("siteName")}`,
      description: t("description"),
    },
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/about`])),
    },
  };
}

type AboutData = {
  profile: Awaited<ReturnType<typeof prisma.profile.findUnique>>;
  roles: Awaited<ReturnType<typeof prisma.profileRoleType.findMany>>;
  experiences: Awaited<ReturnType<typeof prisma.profileExperience.findMany>>;
  faqs: Awaited<ReturnType<typeof prisma.profileFaq.findMany>>;
};

async function getAboutData(): Promise<AboutData> {
  // Tolerate build-time DB unavailability: page renders an empty hero rather
  // than failing the build. ISR refreshes on first real request.
  try {
    const [profile, roles, experiences, faqs] = await Promise.all([
      prisma.profile.findUnique({ where: { id: "singleton" } }),
      prisma.profileRoleType.findMany({ orderBy: { order: "asc" } }),
      prisma.profileExperience.findMany({ orderBy: { order: "asc" } }),
      prisma.profileFaq.findMany({ orderBy: { order: "asc" } }),
    ]);
    return { profile, roles, experiences, faqs };
  } catch (err) {
    console.warn("[about] getAboutData failed:", err);
    return { profile: null, roles: [], experiences: [], faqs: [] };
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "about" });

  const { profile, roles, experiences, faqs } = await getAboutData();

  const tagline = profile ? pick(profile.tagline, locale) : "";
  const bio = profile ? pick(profile.bio, locale) : "";
  const approach = profile ? pick(profile.approach, locale) : "";

  const bioParagraphs = bio.split(/\n{2,}/).filter(Boolean);
  const approachParagraphs = approach.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      {/* Hero */}
      <header className="mb-16 flex flex-col items-center gap-5 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
          {t("eyebrow")}
        </span>
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          {tagline ? <GradientText>{tagline}</GradientText> : t("title")}
        </h1>
        {(profile?.location || profile?.availability) && (
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            {profile?.location && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {profile.location}
              </span>
            )}
            {profile?.availability && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1 text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                {profile.availability}
              </span>
            )}
          </div>
        )}
      </header>

      {/* Bio */}
      {bioParagraphs.length > 0 && (
        <section className="mb-20">
          <div className="mx-auto max-w-2xl space-y-4">
            {bioParagraphs.map((p, i) => (
              <p key={i} className="text-base leading-relaxed text-foreground/85 sm:text-lg">
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Approach */}
      {approachParagraphs.length > 0 && (
        <section className="mb-20">
          <SectionHeader
            eyebrow={t("approachEyebrow")}
            title={t("approachTitle")}
            align="start"
            className="mb-6"
          />
          <div className="space-y-4">
            {approachParagraphs.map((p, i) => (
              <p key={i} className="text-base leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Role types */}
      {roles.length > 0 && (
        <section className="mb-20">
          <SectionHeader
            eyebrow={t("rolesEyebrow")}
            title={t("rolesTitle")}
            description={t("rolesDescription")}
            align="start"
            className="mb-8"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {roles.map((role) => (
              <div
                key={role.id}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 transition-all duration-300 hover:border-primary/25 hover:bg-primary/[0.04]"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    {pick(role.title, locale)}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {pick(role.description, locale)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience timeline */}
      {experiences.length > 0 && (
        <section className="mb-20">
          <SectionHeader
            eyebrow={t("experienceEyebrow")}
            title={t("experienceTitle")}
            align="start"
            className="mb-8"
          />
          <ol className="relative ml-3 space-y-8 border-l border-white/[0.08] pl-8">
            {experiences.map((exp) => (
              <li key={exp.id} className="relative">
                <span
                  className="absolute -left-[37px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary/30 ring-4 ring-background"
                  aria-hidden
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-base font-semibold text-foreground">
                    {pick(exp.role, locale)}
                    <span className="text-muted-foreground"> · {exp.company}</span>
                  </h3>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground/70">
                    {exp.period}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {pick(exp.highlights, locale)}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="mb-20">
          <SectionHeader
            eyebrow={t("faqEyebrow")}
            title={t("faqTitle")}
            align="start"
            className="mb-8"
          />
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className="group rounded-xl border border-white/[0.07] bg-white/[0.02] open:border-primary/20 open:bg-primary/[0.03]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-foreground/90 transition-colors hover:text-foreground">
                  <span>{pick(faq.question, locale)}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-muted-foreground">
                  {pick(faq.answer, locale)}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.06] px-8 py-10 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/5" aria-hidden />
        <div className="relative">
          <p className="mb-2 text-lg font-semibold">
            <GradientText>{t("ctaTitle")}</GradientText>
          </p>
          <p className="mb-6 text-sm text-muted-foreground">{t("ctaDescription")}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-6 py-2.5",
                "bg-primary/90 text-sm font-semibold text-white",
                "hover:bg-primary transition-colors duration-200",
                "shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_28px_rgba(139,92,246,0.5)]",
              )}
            >
              {t("ctaPrimary")}
            </Link>
            <Link
              href="/recruiter"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-foreground"
            >
              {t("ctaSecondary")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
