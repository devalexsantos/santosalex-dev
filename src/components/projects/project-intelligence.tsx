"use client";

/**
 * ProjectIntelligence — inline AI chat scoped to a single project.
 *
 * Design choice: inline (not modal) for the project case-study page.
 * Rationale: users are already deep in a case study; a modal would break
 * reading flow. The inline variant gives contextual AI access without
 * leaving the content.
 *
 * Passes sourceType="project" + sourceId to /api/chat so RAG search is
 * scoped to only that project's AiChunk rows.
 */

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { PortfolioChat } from "@/components/chat/portfolio-chat";

type ProjectIntelligenceProps = {
  projectId: string;
  projectTitle: string;
};

export function ProjectIntelligence({
  projectId,
  projectTitle,
}: ProjectIntelligenceProps) {
  const t = useTranslations("projectIntelligence");

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-start gap-4 rounded-2xl border border-violet-500/15 bg-violet-500/[0.04] p-5">
        <div className="shrink-0 rounded-xl bg-violet-500/15 p-2.5">
          <Sparkles className="h-5 w-5 text-violet-300" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {t("title")}
          </p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
            {t("subtitle")}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground/40">
            {projectTitle}
          </p>
        </div>
      </div>

      {/* Inline chat panel */}
      <PortfolioChat
        variant="inline"
        sourceType="project"
        sourceId={projectId}
      />
    </div>
  );
}
