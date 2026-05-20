"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProjectCard } from "@/components/ui/project-card";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";

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

interface ProjectData {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  status: ProjectStatus;
  categories: ProjectCategory[];
  year: number | null;
  coverImage: string | null;
  demoUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
  stack: StackItem[];
}

interface FeaturedProjectsSectionProps {
  projects: ProjectData[];
}

export function FeaturedProjectsSection({ projects }: FeaturedProjectsSectionProps) {
  const t = useTranslations("home.sections");

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
      >
        <SectionHeader
          eyebrow={t("featuredProjects")}
          title={t("featuredProjects")}
          description={t("featuredProjectsDesc")}
          align="start"
        />
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 border-white/[0.10] text-muted-foreground hover:text-foreground"
          disabled
          aria-disabled="true"
        >
          {t("viewAll")}
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </motion.div>

      {projects.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/[0.08] text-sm text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
            >
              <ProjectCard
                slug={project.slug}
                title={project.title}
                shortDescription={project.shortDescription}
                status={project.status}
                categories={project.categories}
                year={project.year}
                coverImage={project.coverImage}
                demoUrl={project.demoUrl}
                githubUrl={project.githubUrl}
                stack={project.stack}
                featured={project.featured}
              />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
