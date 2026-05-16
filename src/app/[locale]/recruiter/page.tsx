import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

// Static shell — the real interactivity happens via /api/recruiter-summary.
export const revalidate = 86400;
import { SectionHeader } from "@/components/ui/section-header";
import { RecruiterMode } from "@/components/recruiter/recruiter-mode";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "recruiter" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const title = `${t("title")} ${t("titleAccent")}`;
  return {
    title,
    description: t("subtitle"),
    openGraph: {
      title: `${title} · ${tCommon("siteName")}`,
      description: t("subtitle"),
    },
    alternates: {
      canonical: `/${locale}/recruiter`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/recruiter`])),
    },
  };
}

export default async function RecruiterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "recruiter" });

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={`${t("title")} ${t("titleAccent")}`}
        description={t("subtitle")}
        align="center"
        titleGradient
        className="mb-12"
      />

      <RecruiterMode />
    </div>
  );
}
