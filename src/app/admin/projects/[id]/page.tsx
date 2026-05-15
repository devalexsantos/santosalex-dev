import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/admin/project-form";
import type { ProjectFormValues } from "@/lib/validators/project";

export const metadata: Metadata = { title: "Editar projeto" };

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();

  const { id } = await params;

  const [project, technologies] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        stack: { include: { technology: { select: { slug: true } } } },
        features: { orderBy: { order: "asc" } },
        decisions: { orderBy: { order: "asc" } },
      },
    }),
    prisma.technology.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: { id: true, slug: true, name: true },
    }),
  ]);

  if (!project) notFound();

  type BilingualJson = Record<string, string>;

  function normalizeBilingual(raw: BilingualJson | null): { "pt-BR": string; en: string } {
    return { "pt-BR": raw?.["pt-BR"] ?? "", en: raw?.en ?? "" };
  }

  type RawLocaleContent = {
    problem?: string;
    hypothesis?: string;
    targetAudience?: string;
    technicalDecisions?: string;
    learnings?: string;
    nextSteps?: string;
    fullDescription?: string;
  };

  function normalizeLocale(raw: RawLocaleContent | undefined) {
    return {
      problem: raw?.problem ?? "",
      hypothesis: raw?.hypothesis ?? "",
      targetAudience: raw?.targetAudience ?? "",
      technicalDecisions: raw?.technicalDecisions ?? "",
      learnings: raw?.learnings ?? "",
      nextSteps: raw?.nextSteps ?? "",
      fullDescription: raw?.fullDescription ?? "",
    };
  }

  const rawContent = project.content as { "pt-BR"?: RawLocaleContent; en?: RawLocaleContent } | null;

  const defaultValues: Partial<ProjectFormValues> = {
    slug: project.slug,
    title: project.title,
    shortDescription: project.shortDescription,
    category: project.category as ProjectFormValues["category"],
    status: project.status as ProjectFormValues["status"],
    year: project.year,
    featured: project.featured,
    order: project.order,
    coverImage: project.coverImage ?? "",
    demoUrl: project.demoUrl ?? "",
    githubUrl: project.githubUrl ?? "",
    content: {
      "pt-BR": normalizeLocale(rawContent?.["pt-BR"]),
      en: normalizeLocale(rawContent?.en),
    },
    architecture: normalizeBilingual(project.architecture as BilingualJson | null),
    challenges: normalizeBilingual(project.challenges as BilingualJson | null),
    techSlugs: project.stack.map((s) => s.technology.slug),
    features: project.features.map((f) => ({
      title: normalizeBilingual(f.title as BilingualJson),
      description: normalizeBilingual(f.description as BilingualJson),
      order: f.order,
    })),
    decisions: project.decisions.map((d) => ({
      title: normalizeBilingual(d.title as BilingualJson),
      description: normalizeBilingual(d.description as BilingualJson),
      reason: normalizeBilingual(d.reason as BilingualJson),
      order: d.order,
    })),
  };

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-8">
        <Link
          href="/admin/projects"
          className="mb-3 flex items-center gap-1.5 text-xs text-white/30 transition-colors hover:text-white/60"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Projetos
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Editar — <span className="text-violet-400">{project.title}</span>
        </h1>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
        <ProjectForm
          projectId={project.id}
          defaultValues={defaultValues}
          technologies={technologies}
        />
      </div>
    </div>
  );
}
