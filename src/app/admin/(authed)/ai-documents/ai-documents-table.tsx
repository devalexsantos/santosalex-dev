"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, RefreshCw } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteAiDocument, reindexDocument } from "./_actions";
import { cn } from "@/lib/utils";

type AiDocument = {
  id: string;
  title: string;
  sourceType: string;
  sourceId: string | null;
  locale: string;
  indexed: boolean;
  updatedAt: Date;
};

const sourceTypeConfig: Record<string, { label: string; className: string }> = {
  project:    { label: "Projeto",      className: "bg-violet-500/10 text-violet-400" },
  post:       { label: "Post",         className: "bg-blue-500/10 text-blue-400" },
  profile:    { label: "Perfil",       className: "bg-emerald-500/10 text-emerald-400" },
  experience: { label: "Experiência",  className: "bg-cyan-500/10 text-cyan-400" },
  faq:        { label: "FAQ",          className: "bg-amber-500/10 text-amber-400" },
  page:       { label: "Página",       className: "bg-white/5 text-white/40" },
};

function IndexedBadge({ indexed }: { indexed: boolean }) {
  if (indexed) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
        Indexado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
      Pendente
    </span>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function AiDocumentsTable({ documents }: { documents: AiDocument[] }) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<AiDocument | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [reindexingId, setReindexingId] = useState<string | null>(null);
  const [, startReindexTransition] = useTransition();

  function handleDelete() {
    if (!deleteTarget) return;
    startDeleteTransition(async () => {
      const result = await deleteAiDocument(deleteTarget.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Documento excluído.");
        router.refresh();
      }
      setDeleteTarget(null);
    });
  }

  function handleReindex(doc: AiDocument) {
    setReindexingId(doc.id);
    toast.loading("Indexando...", { id: `reindex-${doc.id}` });
    startReindexTransition(async () => {
      const result = await reindexDocument(doc.id);
      if (result?.error) {
        toast.error(result.error, { id: `reindex-${doc.id}` });
      } else {
        toast.success(
          `${result.chunks ?? 0} chunks gerados`,
          { id: `reindex-${doc.id}` }
        );
        router.refresh();
      }
      setReindexingId(null);
    });
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-10 text-center">
        <p className="text-sm text-white/30">Nenhum documento cadastrado.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.06] hover:bg-transparent">
              <TableHead className="text-xs text-white/40 font-medium">Título</TableHead>
              <TableHead className="text-xs text-white/40 font-medium">Tipo</TableHead>
              <TableHead className="text-xs text-white/40 font-medium">Source ID</TableHead>
              <TableHead className="text-xs text-white/40 font-medium">Locale</TableHead>
              <TableHead className="text-xs text-white/40 font-medium">Status</TableHead>
              <TableHead className="text-xs text-white/40 font-medium">Atualizado</TableHead>
              <TableHead className="text-xs text-white/40 font-medium text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => {
              const srcType = sourceTypeConfig[doc.sourceType] ?? { label: doc.sourceType, className: "bg-white/5 text-white/40" };
              return (
                <TableRow
                  key={doc.id}
                  className="border-white/[0.04] hover:bg-white/[0.02]"
                >
                  <TableCell>
                    <p className="text-sm font-medium text-white/85 max-w-[200px] truncate" title={doc.title}>
                      {doc.title}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", srcType.className)}>
                      {srcType.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    {doc.sourceId ? (
                      <span className="font-mono text-[11px] text-white/30 truncate max-w-[100px] block" title={doc.sourceId}>
                        {doc.sourceId.length > 12 ? doc.sourceId.slice(0, 12) + "…" : doc.sourceId}
                      </span>
                    ) : (
                      <span className="text-[11px] text-white/20">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="rounded bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-white/50">
                      {doc.locale}
                    </span>
                  </TableCell>
                  <TableCell>
                    <IndexedBadge indexed={doc.indexed} />
                  </TableCell>
                  <TableCell className="text-[11px] text-white/30">
                    {formatDate(doc.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleReindex(doc)}
                        disabled={reindexingId === doc.id}
                        className="rounded p-1.5 text-white/30 transition-colors hover:text-amber-400 disabled:opacity-40"
                        title="Re-indexar (chunk + embed + pgvector)"
                      >
                        <RefreshCw className={cn("h-3.5 w-3.5", reindexingId === doc.id && "animate-spin")} />
                      </button>
                      <Link
                        href={`/admin/ai-documents/${doc.id}`}
                        className="rounded p-1.5 text-white/30 transition-colors hover:text-violet-400"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(doc)}
                        className="rounded p-1.5 text-white/30 transition-colors hover:text-red-400"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border-white/[0.08] bg-[#111118] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              Tem certeza que deseja excluir{" "}
              <strong className="text-white/80">{deleteTarget?.title}</strong>? Todos os chunks e
              embeddings associados serão removidos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/[0.08] bg-transparent text-white/50 hover:bg-white/[0.04]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
