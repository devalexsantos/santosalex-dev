import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Cpu } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { AiDocumentsTable } from "./ai-documents-table";
import { ReindexAllButton } from "./reindex-all-button";
import { SyncFromEditorialButton } from "./sync-button";

export const metadata: Metadata = { title: "AI Documents" };

export default async function AdminAiDocumentsPage() {
  await requireAdminSession();

  const documents = await prisma.aiDocument.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      sourceType: true,
      sourceId: true,
      locale: true,
      indexed: true,
      updatedAt: true,
    },
  });

  const pendingCount = documents.filter((d) => !d.indexed).length;
  const indexedCount = documents.filter((d) => d.indexed).length;

  return (
    <div className="px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AI Documents</h1>
          <p className="mt-1 text-sm text-white/40">
            {documents.length} documentos —{" "}
            <span className="text-emerald-400">{indexedCount} indexados</span>
            {" · "}
            <span className="text-amber-400">{pendingCount} pendentes</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SyncFromEditorialButton />
          <ReindexAllButton />
          <Link
            href="/admin/ai-documents/new"
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
            Novo documento
          </Link>
        </div>
      </div>

      {/* Pipeline status */}
      <div className="mb-6 flex items-start gap-2 rounded-lg border border-violet-500/[0.10] bg-violet-500/[0.03] px-4 py-3">
        <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-violet-400/60" />
        <p className="text-xs leading-relaxed text-white/40">
          Pipeline ativa —{" "}
          <strong className="text-white/60">text-embedding-3-small · 1536 dim</strong>
          {" · "}Re-index é manual (botão acima). Cron automático chega na Fase 7.
        </p>
      </div>

      <AiDocumentsTable documents={documents} />
    </div>
  );
}
