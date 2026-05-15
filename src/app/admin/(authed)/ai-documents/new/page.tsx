import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { AiDocumentForm } from "@/components/admin/ai-document-form";

export const metadata: Metadata = { title: "Novo AI Document" };

export default async function NewAiDocumentPage() {
  await requireAdminSession();

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="mb-8">
        <Link
          href="/admin/ai-documents"
          className="mb-3 flex items-center gap-1.5 text-xs text-white/30 transition-colors hover:text-white/60"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          AI Documents
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white">Novo AI Document</h1>
        <p className="mt-1 text-sm text-white/40">
          Conteúdo que será fragmentado e embedado para o assistente de IA (Fase 5).
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
        <AiDocumentForm />
      </div>
    </div>
  );
}
