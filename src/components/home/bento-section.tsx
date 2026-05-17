"use client";

import {
  Code2,
  FileText,
  Layers,
  BriefcaseBusiness,
} from "lucide-react";
import { useTranslations } from "next-intl";
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
        <BentoCard size="tall" glowColor="primary" className="group">
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
                <h3 className="text-xl font-bold leading-tight tracking-tight mb-2">
                  {featuredProject.title}
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

        {/* ── 5. Open to work — wide (2×1) ─────────── */}
        <BentoCard size="wide" glowColor="accent">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 to-transparent" />
          <div className="relative flex h-full flex-col justify-between p-5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs text-emerald-400 font-medium">{t("openToWork")}</span>
            </div>
            <div className="flex items-center gap-3">
              <BriefcaseBusiness className="h-6 w-6 shrink-0 text-emerald-400/60" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("openToWorkDesc")}
              </p>
            </div>
          </div>
        </BentoCard>
      </BentoGrid>
    </section>
  );
}
