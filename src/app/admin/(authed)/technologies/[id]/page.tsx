import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { TechnologyForm } from "@/components/admin/technology-form";
import type { TechnologyFormValues } from "@/lib/validators/technology";

export const metadata: Metadata = { title: "Editar tecnologia" };

export default async function EditTechnologyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();

  const { id } = await params;

  const technology = await prisma.technology.findUnique({ where: { id } });
  if (!technology) notFound();

  const defaultValues: TechnologyFormValues = {
    slug: technology.slug,
    name: technology.name,
    category: technology.category as TechnologyFormValues["category"],
    experienceLevel: technology.experienceLevel as TechnologyFormValues["experienceLevel"],
    icon: technology.icon ?? "",
    description: technology.description ?? "",
  };

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <div className="mb-8">
        <Link
          href="/admin/technologies"
          className="mb-3 flex items-center gap-1.5 text-xs text-white/30 transition-colors hover:text-white/60"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Tecnologias
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Editar — <span className="text-violet-400">{technology.name}</span>
        </h1>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
        <TechnologyForm technologyId={technology.id} defaultValues={defaultValues} />
      </div>
    </div>
  );
}
