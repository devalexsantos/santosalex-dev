"use client";

import {
  Code2,
  FileText,
  Layers,
  Target,
  ArrowUpRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { StackBadge } from "@/components/ui/stack-badge";
import { Badge } from "@/components/ui/badge";

const CORE_STACK = [
  { name: "Next.js",    category: "frontend" as const },
  { name: "TypeScript", category: "frontend" as const },
  { name: "React",      category: "frontend" as const },
  { name: "Tailwind",   category: "frontend" as const },
  { name: "Node.js",    category: "backend" as const },
  { name: "Prisma",     category: "backend" as const },
  { name: "PostgreSQL", category: "database" as const },
  { name: "pgvector",   category: "database" as const },
  { name: "Redis",      category: "database" as const },
  { name: "OpenAI",     category: "ai" as const },
  { name: "Docker",     category: "devops" as const },
  { name: "EasyPanel",  category: "infra" as const },
];

interface BentoSectionProps {
  featuredProject?: {
    title: string;
    shortDescription: string;
    slug: string;
    category: string;
    status: string;
  } | null;
}

export function BentoSection({ featuredProject }: BentoSectionProps) {
  const t = useTranslations("home.bento");

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <BentoGrid className="lg:auto-rows-[160px]">
        {/* ── 1. Featured Project — tall (1×3) ─────── */}
        <BentoCard
          size="tall"
          glowColor="primary"
          className={featuredProject ? "group cursor-pointer" : "group"}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/8 to-transparent" />
          <div className="relative flex h-full flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                {t("featuredProject")}
              </span>
              {featuredProject && (
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-400"
                >
                  {featuredProject.status === "shipped" ? "Shipped" : featuredProject.status}
                </Badge>
              )}
            </div>

            {featuredProject ? (
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground/60 mb-1">
                  {featuredProject.category}
                </p>
                <h3 className="text-xl font-bold leading-tight tracking-tight mb-2 flex items-start gap-1.5 group-hover:text-primary transition-colors">
                  {featuredProject.title}
                  <ArrowUpRight className="h-4 w-4 shrink-0 mt-1 opacity-60 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
                  {featuredProject.shortDescription}
                </p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">{t("comingSoon")}</div>
            )}

            <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-primary/60 to-accent/60" />
            </div>
          </div>

          {/* Full-card clickable overlay — sits above content but doesn't
              interfere with hover-on-content because pointer events are on
              the Link itself. Renders only when there is a project. */}
          {featuredProject && (
            <Link
              href={`/projects/${featuredProject.slug}`}
              aria-label={featuredProject.title}
              className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          )}
        </BentoCard>

        {/* ── 3. Stack Snapshot — wide (2×1) ────────── */}
        <BentoCard size="wide" glowColor="primary">
          <div className="relative flex h-full flex-col justify-between p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Layers className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold">{t("stackSnapshot")}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CORE_STACK.slice(0, 8).map((tech) => (
                <StackBadge
                  key={tech.name}
                  name={tech.name}
                  category={tech.category}
                />
              ))}
            </div>
          </div>
        </BentoCard>

        {/* ── 4. Build Notes — sm ───────────────────── */}
        <BentoCard size="sm" glowColor="primary" className="group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/6 to-transparent" />
          <div className="relative flex h-full flex-col justify-between p-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="mb-1 text-sm font-semibold">{t("buildNotes")}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {t("buildNotesDesc")}
              </p>
            </div>
          </div>
        </BentoCard>

        {/* ── 5. Fullstack — sm ─────────────────────── */}
        <BentoCard size="sm" glowColor="primary">
          <div className="relative flex h-full flex-col justify-between p-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
              <Code2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="mb-1 text-sm font-semibold">{t("fullstack")}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {t("fullstackDesc")}
              </p>
            </div>
          </div>
        </BentoCard>

        {/* ── 5. Recruiter Mode — wide (2×1), clickable ──── */}
        <BentoCard size="wide" glowColor="primary" className="group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-violet-500/6 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative flex h-full flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                {t("recruiterModeLabel")}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary/80 transition-all group-hover:text-primary group-hover:translate-x-0.5">
                {t("recruiterModeCta")}
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5" />
              </span>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 border border-primary/20 text-primary">
                <Target className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                  {t("recruiterModeTitle")}
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {t("recruiterModeDesc")}
                </p>
              </div>
            </div>
          </div>

          {/* Full-card overlay link */}
          <Link
            href="/recruiter"
            aria-label={t("recruiterModeLabel")}
            className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          />
        </BentoCard>
      </BentoGrid>
    </section>
  );
}
