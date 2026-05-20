"use client";

import { motion } from "framer-motion";
import { ExternalLink, ArrowUpRight, GitFork } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StackBadge } from "@/components/ui/stack-badge";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

type ProjectStatus = "draft" | "in_progress" | "shipped" | "archived";
type ProjectCategory =
  | "saas"
  | "ai"
  | "frontend"
  | "fullstack"
  | "automation"
  | "infra"
  | "experiment";

interface StackItem {
  name: string;
  category?: "frontend" | "backend" | "database" | "ai" | "devops" | "infra" | "automation" | "payments" | "email" | "testing" | "other";
}

interface ProjectCardProps {
  slug: string;
  title: string;
  shortDescription: string;
  status: ProjectStatus;
  categories: ProjectCategory[];
  year?: number | null;
  coverImage?: string | null;
  demoUrl?: string | null;
  githubUrl?: string | null;
  stack?: StackItem[];
  featured?: boolean;
  className?: string;
}

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  draft:       { label: "Draft",       className: "border-white/15 text-muted-foreground" },
  in_progress: { label: "In Progress", className: "border-amber-500/30 text-amber-400 bg-amber-500/10" },
  shipped:     { label: "Shipped",     className: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" },
  archived:    { label: "Archived",    className: "border-white/15 text-muted-foreground" },
};

const categoryLabels: Record<ProjectCategory, string> = {
  saas:       "SaaS",
  ai:         "AI",
  frontend:   "Frontend",
  fullstack:  "Fullstack",
  automation: "Automation",
  infra:      "Infra",
  experiment: "Experiment",
};

export function ProjectCard({
  slug,
  title,
  shortDescription,
  status,
  categories,
  year,
  demoUrl,
  githubUrl,
  stack = [],
  className,
}: ProjectCardProps) {
  const statusStyle = statusConfig[status];

  return (
    <motion.article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl",
        "border border-white/[0.07] bg-white/[0.03]",
        "backdrop-blur-sm",
        "transition-all duration-300",
        "hover:border-primary/25",
        "hover:shadow-[0_0_0_1px_rgba(139,92,246,0.2),0_0_40px_rgba(139,92,246,0.12)]",
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -3 }}
    >
      {/* Top bar accent */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex flex-1 flex-col gap-4 p-6">
        {/* Header (decorative — single tab stop is the overlay link below) */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn("text-[10px] font-semibold uppercase tracking-wide", statusStyle.className)}
            >
              {statusStyle.label}
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category}
                variant="outline"
                className="border-primary/20 bg-primary/8 text-[10px] font-semibold uppercase tracking-wide text-primary"
              >
                {categoryLabels[category]}
              </Badge>
            ))}
            {year && (
              <span className="text-xs text-muted-foreground">{year}</span>
            )}
          </div>
          <span
            aria-hidden
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:text-foreground"
          >
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="mb-2 text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {shortDescription}
          </p>
        </div>

        {/* Stack */}
        {stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {stack.slice(0, 4).map((tech) => (
              <StackBadge
                key={tech.name}
                name={tech.name}
                category={tech.category}
              />
            ))}
            {stack.length > 4 && (
              <span className="inline-flex items-center rounded-full border border-white/10 px-2.5 py-1 text-xs text-muted-foreground">
                +{stack.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer links — sit ABOVE the overlay (z-20) so demo/github clicks
            beat the case-study navigation. */}
        {(demoUrl || githubUrl) && (
          <div className="relative z-20 flex items-center gap-3 border-t border-white/[0.06] pt-4">
            {demoUrl && (
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Demo
              </a>
            )}
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <GitFork className="h-3.5 w-3.5" />
                GitHub
              </a>
            )}
          </div>
        )}
      </div>

      {/* Full-card overlay link — single tab stop covering the whole card.
          Lower z than the demo/github footer so external links still work. */}
      <Link
        href={`/projects/${slug}`}
        aria-label={title}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      />
    </motion.article>
  );
}
