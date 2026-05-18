import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

// Fully static content driven by i18n — revalidate once a day is plenty.
export const revalidate = 86400;
import { SectionHeader } from "@/components/ui/section-header";
import { GradientText } from "@/components/ui/gradient-text";
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
  const t = await getTranslations({ locale, namespace: "howIBuild" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: `${t("title")} · ${tCommon("siteName")}`,
      description: t("description"),
    },
    alternates: {
      canonical: `/${locale}/how-i-build`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/how-i-build`])),
    },
  };
}

// ---------------------------------------------------------------------------
// Step accent colors — cycling through a small palette
// ---------------------------------------------------------------------------

const STEP_ACCENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-pink-500 to-rose-500",
  "from-violet-500 to-blue-500",
  "from-emerald-500 to-cyan-500",
  "from-purple-500 to-violet-600",
  "from-sky-500 to-blue-600",
  "from-violet-500 to-emerald-500",
] as const;

const STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function HowIBuildPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "howIBuild" });

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      {/* Hero */}
      <SectionHeader
        as="h1"
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        align="center"
        titleGradient
        className="mb-20"
      />

      {/* Timeline */}
      <div className="relative">
        {/* Vertical connector line — desktop only */}
        <div
          className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/[0.08] to-transparent lg:block"
          aria-hidden
        />

        <ol className="space-y-10 lg:space-y-0">
          {STEPS.map((stepNum, index) => {
            const isEven = index % 2 === 0;
            const accent = STEP_ACCENTS[index];
            const title = t(`steps.${stepNum}.title`);
            const description = t(`steps.${stepNum}.description`);

            return (
              <li
                key={stepNum}
                className={cn(
                  // Mobile: stacked vertical card
                  "relative flex flex-col",
                  // Desktop: alternating sides
                  "lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center lg:mb-16",
                )}
              >
                {/* ── Number badge (centered on the line, desktop) ──────── */}
                <div
                  className="absolute left-1/2 hidden -translate-x-1/2 lg:flex"
                  aria-hidden
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      "bg-gradient-to-br",
                      accent,
                      "text-sm font-bold text-white",
                      "shadow-[0_0_20px_rgba(139,92,246,0.35)]",
                      "z-10",
                    )}
                  >
                    {stepNum}
                  </div>
                </div>

                {/* ── Card — left side on even, right side on odd ───────── */}
                {/* On desktop, if even → card in col-1, if odd → card in col-2 */}
                {/* We use order to swap */}
                <div
                  className={cn(
                    "relative rounded-2xl border border-white/[0.07] bg-white/[0.025]",
                    "p-6 backdrop-blur-sm",
                    "transition-all duration-300 hover:border-white/[0.12]",
                    "hover:shadow-[0_0_0_1px_rgba(139,92,246,0.15),0_0_25px_rgba(139,92,246,0.08)]",
                    // Desktop layout
                    isEven ? "lg:col-start-1 lg:text-right" : "lg:col-start-2 lg:text-left",
                  )}
                >
                  {/* Mobile number badge */}
                  <div className="mb-4 flex items-center gap-3 lg:hidden">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        "bg-gradient-to-br",
                        accent,
                        "text-xs font-bold text-white",
                      )}
                    >
                      {stepNum}
                    </div>
                    <div className={cn("h-px flex-1 bg-gradient-to-r", accent, "opacity-20")} />
                  </div>

                  {/* Top accent line */}
                  <div
                    className={cn(
                      "mb-4 hidden h-px w-12 bg-gradient-to-r lg:block",
                      accent,
                      "opacity-60",
                      isEven ? "ml-auto" : "mr-auto",
                    )}
                    aria-hidden
                  />

                  <h3 className="mb-2 text-base font-semibold leading-snug tracking-tight">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>

                {/* ── Spacer col (desktop) ───────────────────────────────── */}
                <div
                  className={cn(
                    "hidden lg:block",
                    isEven ? "lg:col-start-2" : "lg:col-start-1",
                  )}
                />
              </li>
            );
          })}
        </ol>
      </div>

      {/* CTA */}
      <div className="mt-20 flex flex-col items-center gap-6 text-center">
        <div className="relative rounded-2xl border border-primary/20 bg-primary/[0.06] px-8 py-10 text-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-secondary/5" aria-hidden />
          <div className="relative">
            <p className="mb-2 text-lg font-semibold">
              <GradientText>{t("cta")}</GradientText>
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              {t("description")}
            </p>
            <Link
              href="/contact"
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-6 py-2.5",
                "bg-primary/90 text-sm font-semibold text-white",
                "hover:bg-primary transition-colors duration-200",
                "shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_28px_rgba(139,92,246,0.5)]",
              )}
            >
              {t("ctaLink")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
