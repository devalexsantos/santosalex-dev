"use client";

import Image from "next/image";
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
    <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-36 sm:px-6 sm:pt-44">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_320px]">
        {/* ── Left column: content ─────────────────────────────────── */}
        <div className="flex flex-col items-start gap-7">
          {/* Status pill */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-4 py-2 backdrop-blur-sm"
          >
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

          {/* Avatar (mobile/tablet only — desktop shows it on the right column) */}
          <motion.div
            custom={0.12}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="lg:hidden"
          >
            <AvatarOrbit size={140} badge={false} />
          </motion.div>

          {/* Headline */}
          <motion.h1
            custom={0.14}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.25rem] xl:text-6xl"
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
        </div>

        {/* ── Right column: avatar with AI orbit (desktop only) ─── */}
        <motion.div
          custom={0.18}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="hidden lg:flex lg:justify-center"
        >
          <AvatarOrbit size={288} badge />
        </motion.div>
      </div>
    </section>
  );
}

/**
 * AvatarOrbit — circular avatar wrapped in a rotating conic-gradient ring,
 * a pulsing backdrop glow and a small orbiting accent dot. The effect reads
 * as "AI engineer" without being kitschy.
 */
function AvatarOrbit({ size, badge }: { size: number; badge: boolean }) {
  const inner = size - 6; // 3px ring on each side

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Pulsing backdrop glow */}
      <motion.div
        aria-hidden
        animate={{ opacity: [0.45, 0.8, 0.45], scale: [1, 1.04, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -inset-8 rounded-full bg-gradient-to-br from-primary/40 via-secondary/30 to-accent/30 blur-3xl"
      />

      {/* Rotating conic-gradient ring (rotation isolated — only the ring spins) */}
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, #8b5cf6 0%, #22d3ee 25%, #a855f7 50%, #ec4899 75%, #8b5cf6 100%)",
        }}
      />

      {/* Static masked image — sibling of the ring so it doesn't inherit rotate */}
      <div
        className="absolute overflow-hidden rounded-full bg-background"
        style={{ inset: 3, width: inner, height: inner }}
      >
        <Image
          src="/avatar.jpeg"
          alt="Alex Santos"
          width={inner}
          height={inner}
          priority
          sizes={`${size}px`}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Small orbiting accent dot */}
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/2 -top-1 h-2 w-2 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_14px_rgba(34,211,238,0.8)]" />
      </motion.div>

      {/* Floating "AI Engineer" badge (only on the large desktop variant) */}
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-primary/30 bg-background/90 px-3.5 py-1.5 text-xs font-semibold text-foreground/90 backdrop-blur-sm shadow-[0_0_20px_rgba(139,92,246,0.45)]"
        >
          <Sparkles className="h-3 w-3 text-primary" />
          Fullstack Dev
        </motion.div>
      )}
    </div>
  );
}
