import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/admin/project-form";

export const metadata: Metadata = { title: "Novo projeto" };

export default async function NewProjectPage() {
  await requireAdminSession();

  const technologies = await prisma.technology.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: { id: true, slug: true, name: true },
  });

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
        <h1 className="text-2xl font-bold tracking-tight text-white">Novo projeto</h1>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
        <ProjectForm
          projectId={null}
          defaultValues={{}}
          technologies={technologies}
        />
      </div>
    </div>
  );
}
