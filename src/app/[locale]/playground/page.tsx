import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Sparkles, Lock } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { RagVisualizer } from "@/components/playground/rag-visualizer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "playground" });
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

export default async function PlaygroundPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "playground" });

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        align="center"
        titleGradient
        className="mb-12"
      />

      {/* Demo: RAG Visualizer */}
      <section className="mb-16">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/40 to-secondary/30">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {t("rag.title")}
            </h2>
            <p className="text-xs text-muted-foreground/70">
              {t("rag.subtitle")}
            </p>
          </div>
        </div>

        <RagVisualizer />
      </section>

      {/* Coming soon */}
      <section>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-muted-foreground/50">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground/60">
              {t("comingSoon.title")}
            </h2>
            <p className="text-xs text-muted-foreground/60">
              {t("comingSoon.subtitle")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(["1", "2", "3", "4"] as const).map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.015] px-5 py-4"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40">
                {t(`comingSoon.items.${i}.tag`)}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground/70">
                {t(`comingSoon.items.${i}.label`)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
