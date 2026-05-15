import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { TechnologiesTable } from "./technologies-table";

export const metadata: Metadata = { title: "Tecnologias" };

export default async function AdminTechnologiesPage() {
  await requireAdminSession();

  const technologies = await prisma.technology.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      experienceLevel: true,
      icon: true,
    },
  });

  return (
    <div className="px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Tecnologias</h1>
          <p className="mt-1 text-sm text-white/40">{technologies.length} tecnologias cadastradas</p>
        </div>
        <Link
          href="/admin/technologies/new"
          className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
          Nova tecnologia
        </Link>
      </div>

      <TechnologiesTable technologies={technologies} />
    </div>
  );
}
