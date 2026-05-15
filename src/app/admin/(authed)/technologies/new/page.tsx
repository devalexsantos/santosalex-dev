import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { TechnologyForm } from "@/components/admin/technology-form";

export const metadata: Metadata = { title: "Nova tecnologia" };

export default async function NewTechnologyPage() {
  await requireAdminSession();

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
        <h1 className="text-2xl font-bold tracking-tight text-white">Nova tecnologia</h1>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
        <TechnologyForm />
      </div>
    </div>
  );
}
