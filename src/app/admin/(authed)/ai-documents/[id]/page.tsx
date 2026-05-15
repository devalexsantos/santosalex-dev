import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { AiDocumentForm } from "@/components/admin/ai-document-form";
import type { AiDocumentFormValues } from "@/lib/validators/ai-document";

export const metadata: Metadata = { title: "Editar AI Document" };

export default async function EditAiDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();

  const { id } = await params;

  const doc = await prisma.aiDocument.findUnique({ where: { id } });
  if (!doc) notFound();

  // Serialize metadata JSON → pretty-printed string for the form
  const metadataString =
    doc.metadata != null ? JSON.stringify(doc.metadata, null, 2) : "";

  const defaultValues: AiDocumentFormValues = {
    title: doc.title,
    sourceType: doc.sourceType as AiDocumentFormValues["sourceType"],
    sourceId: doc.sourceId ?? "",
    locale: doc.locale as AiDocumentFormValues["locale"],
    content: doc.content,
    metadata: metadataString,
  };

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
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Editar — <span className="text-violet-400">{doc.title}</span>
        </h1>
        <p className="mt-1 text-sm text-white/40">
          Status:{" "}
          {doc.indexed ? (
            <span className="text-emerald-400">Indexado</span>
          ) : (
            <span className="text-amber-400">Pendente</span>
          )}
          {" — salvar irá redefinir para Pendente."}
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
        <AiDocumentForm documentId={doc.id} defaultValues={defaultValues} />
      </div>
    </div>
  );
}
