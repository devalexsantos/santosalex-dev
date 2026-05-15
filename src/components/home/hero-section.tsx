"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { GradientText } from "@/components/ui/gradient-text";
import { Link } from "@/i18n/navigation";

export interface HeroSectionProps {
  /** Live tagline from Profile (admin-editable). Falls back to i18n string. */
  taglineOverride?: string | null;
  /** Live availability label from Profile. Falls back to i18n string. */
  availabilityOverride?: string | null;
}

export function HeroSection({
  taglineOverride,
  availabilityOverride,
}: HeroSectionProps = {}) {
  const t = useTranslations("home");

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: "easeOut" as const, delay },
    }),
  };

  return (
    <section className="relative mx-auto flex max-w-6xl flex-col items-start gap-7 px-4 pb-20 pt-36 sm:px-6 sm:pt-44">
      {/* Status pill */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-4 py-2 backdrop-blur-sm"
      >
        {/* Pulsing green dot */}
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {availabilityOverride?.trim() || t("statusLabel")}
        </span>
      </motion.div>

      {/* Eyebrow */}
      <motion.span
        custom={0.08}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary"
      >
        {t("eyebrow")}
      </motion.span>

      {/* Headline */}
      <motion.h1
        custom={0.14}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="max-w-3xl text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl"
      >
        {t("title")}{" "}
        <br className="hidden sm:block" />
        <GradientText>{t("titleAccent")}</GradientText>
      </motion.h1>

      {/* Subtitle — prefers Profile.tagline (admin-editable) over i18n */}
      <motion.p
        custom={0.2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
      >
        {taglineOverride?.trim() || t("subtitle")}
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        custom={0.26}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap gap-3"
      >
        <Link href="/projects">
          <Button
            size="lg"
            className="gap-2 bg-primary/90 text-white hover:bg-primary shadow-[0_0_24px_rgba(139,92,246,0.35)] hover:shadow-[0_0_32px_rgba(139,92,246,0.5)] transition-all duration-200"
          >
            {t("ctaProjects")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        <Button
          size="lg"
          variant="outline"
          className="gap-2 border-white/[0.12] bg-white/[0.03] text-foreground hover:bg-white/[0.07] hover:border-primary/30 transition-all duration-200"
          onClick={() => window.dispatchEvent(new CustomEvent("portfolio-chat:open"))}
        >
          <Sparkles className="h-4 w-4 text-primary" />
          {t("ctaChat")}
        </Button>

        <Link href="/build-notes">
          <Button
            size="lg"
            variant="ghost"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <BookOpen className="h-4 w-4" />
            {t("ctaBuildNotes")}
          </Button>
        </Link>
      </motion.div>

      {/* Scroll hint — decorative */}
      <motion.div
        custom={0.4}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-4 flex items-center gap-3 text-xs text-muted-foreground/50"
      >
        <div className="flex h-5 w-3 items-start justify-center rounded-full border border-white/10 p-0.5">
          <motion.div
            className="h-1 w-0.5 rounded-full bg-muted-foreground/40"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <span>scroll</span>
      </motion.div>
    </section>
  );
}
