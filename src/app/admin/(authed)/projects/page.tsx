import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { ProjectsTable } from "./projects-table";

export const metadata: Metadata = { title: "Projetos" };

export default async function AdminProjectsPage() {
  await requireAdminSession();

  const projects = await prisma.project.findMany({
    orderBy: [{ order: "asc" }, { year: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      categories: true,
      status: true,
      translationStatus: true,
      year: true,
      featured: true,
      order: true,
    },
  });

  return (
    <div className="px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Projetos</h1>
          <p className="mt-1 text-sm text-white/40">{projects.length} projetos cadastrados</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
          Novo projeto
        </Link>
      </div>

      <ProjectsTable projects={projects} />
    </div>
  );
}
