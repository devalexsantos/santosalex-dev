"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type PostCategory =
  | "architecture"
  | "ai"
  | "saas"
  | "frontend"
  | "backend"
  | "infra"
  | "product"
  | "experiment"
  | "deploy"
  | "performance";

interface PostCardProps {
  slug: string;
  title: string;
  excerpt: string;
  category: PostCategory;
  tags?: string[];
  readingTime?: number | null;
  publishedAt?: Date | null;
  locale: string;
  className?: string;
  /** Formatted reading time string, e.g. "8 min de leitura" */
  readingTimeLabel?: string;
  /** Formatted date string */
  publishedAtLabel?: string;
}

const categoryColors: Record<PostCategory, string> = {
  architecture: "border-blue-500/25 bg-blue-500/8 text-blue-300",
  ai:           "border-violet-500/25 bg-violet-500/8 text-violet-300",
  saas:         "border-emerald-500/25 bg-emerald-500/8 text-emerald-300",
  frontend:     "border-sky-500/25 bg-sky-500/8 text-sky-300",
  backend:      "border-amber-500/25 bg-amber-500/8 text-amber-300",
  infra:        "border-orange-500/25 bg-orange-500/8 text-orange-300",
  product:      "border-pink-500/25 bg-pink-500/8 text-pink-300",
  experiment:   "border-rose-500/25 bg-rose-500/8 text-rose-300",
  deploy:       "border-cyan-500/25 bg-cyan-500/8 text-cyan-300",
  performance:  "border-yellow-500/25 bg-yellow-500/8 text-yellow-300",
};

export function PostCard({
  slug,
  title,
  excerpt,
  category,
  tags = [],
  readingTimeLabel,
  publishedAtLabel,
  className,
}: PostCardProps) {
  const catColor = categoryColors[category] ?? "border-white/15 text-muted-foreground";

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
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <Badge
            variant="outline"
            className={cn("text-[10px] font-semibold uppercase tracking-wide", catColor)}
          >
            {category}
          </Badge>
          <Link
            href={`/build-notes/${slug}`}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all duration-200 hover:bg-white/8 hover:text-foreground group-hover:opacity-100"
            aria-label={`Read ${title}`}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1">
          <Link href={`/build-notes/${slug}`} className="block">
            <h3 className="mb-2 text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
              {title}
            </h3>
          </Link>
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {excerpt}
          </p>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="inline-flex items-center rounded-full border border-white/[0.08] px-2 py-0.5 text-[11px] text-muted-foreground">
                +{tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Meta footer */}
        {(readingTimeLabel || publishedAtLabel) && (
          <div className="flex items-center gap-3 border-t border-white/[0.06] pt-4 text-xs text-muted-foreground">
            {readingTimeLabel && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {readingTimeLabel}
              </span>
            )}
            {publishedAtLabel && (
              <span className="ml-auto">{publishedAtLabel}</span>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}
