import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SectionHeader } from "@/components/ui/section-header";
import { GlowCard } from "@/components/ui/glow-card";
import { CopyEmailButton } from "@/components/contact/copy-email-button";
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
  const t = await getTranslations({ locale, namespace: "contact" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: `${t("title")} · ${tCommon("siteName")}`,
      description: t("description"),
    },
    alternates: {
      canonical: `/${locale}/contact`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/contact`])),
    },
  };
}

// ---------------------------------------------------------------------------
// Inline social icons (lucide-react v1 dropped social icons)
// ---------------------------------------------------------------------------

function IconGithub({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function IconLinkedin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 17L17 7M7 7h10v10" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EMAIL = "devalexsantos@gmail.com";

const SOCIAL_LINKS = [
  {
    platform: "GitHub",
    handle: "devalexsantos",
    url: "https://github.com/devalexsantos",
    Icon: IconGithub,
    accent: "group-hover:border-white/25 group-hover:shadow-[0_0_25px_rgba(255,255,255,0.06)]",
    iconColor: "text-white/70 group-hover:text-white",
  },
  {
    platform: "LinkedIn",
    handle: "devalexsantos",
    url: "https://linkedin.com/in/devalexsantos/",
    Icon: IconLinkedin,
    accent: "group-hover:border-blue-500/40 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.12)]",
    iconColor: "text-blue-400/70 group-hover:text-blue-400",
  },
] as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      {/* Hero */}
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        align="center"
        titleGradient
        className="mb-14"
      />

      <div className="flex flex-col gap-5">
        {/* ── Email block ───────────────────────────────────────────── */}
        <GlowCard noHover className="p-8">
          <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <MailIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                  {t("emailCta")}
                </p>
              </div>
            </div>

            {/* Email address */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xl font-semibold tracking-tight sm:text-2xl">
                {EMAIL}
              </span>
              <CopyEmailButton
                email={EMAIL}
                copyLabel={t("copyEmail")}
                copiedLabel={t("copyEmailDone")}
              />
            </div>

            {/* mailto CTA */}
            <a
              href={`mailto:${EMAIL}`}
              className={cn(
                "inline-flex w-fit items-center gap-2 rounded-xl px-5 py-2.5",
                "bg-primary/90 text-sm font-semibold text-white",
                "hover:bg-primary transition-colors duration-200",
                "shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_28px_rgba(139,92,246,0.5)]",
              )}
            >
              <MailIcon className="h-4 w-4" aria-hidden />
              {t("emailMe")}
            </a>
          </div>
        </GlowCard>

        {/* ── Social cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SOCIAL_LINKS.map(({ platform, handle, url, Icon, accent, iconColor }) => (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group relative flex flex-col gap-4 overflow-hidden rounded-2xl",
                "border border-white/[0.07] bg-white/[0.025] p-6",
                "transition-all duration-300",
                accent,
              )}
            >
              {/* Icon */}
              <div className={cn("transition-colors duration-200", iconColor)}>
                <Icon className="h-7 w-7" />
              </div>

              {/* Info */}
              <div>
                <p className="mb-0.5 text-base font-semibold">{platform}</p>
                <p className="text-sm text-muted-foreground">@{handle}</p>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                {t("openProfile")}
                <ArrowUpRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>

              {/* Corner glow */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/[0.02] blur-2xl" aria-hidden />
            </a>
          ))}
        </div>

        {/* ── Availability block ────────────────────────────────────── */}
        <GlowCard glowColor="accent" noHover className="p-7">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              {/* Pulsing availability dot */}
              <div className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
                {t("availability")}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("availabilityBody")}
            </p>
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
