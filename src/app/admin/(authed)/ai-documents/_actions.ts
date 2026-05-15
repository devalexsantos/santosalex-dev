"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { aiDocumentSchema, type AiDocumentFormValues } from "@/lib/validators/ai-document";
import { syncAllAiDocuments } from "@/lib/ai/sync";
import { indexAiDocument, indexAllPendingDocuments } from "@/lib/ai/indexing";

// ---------------------------------------------------------------------------
// saveAiDocument — create or update
//
// IMPORTANT: Every save sets `indexed = false`.
// Rationale: any content change invalidates existing AiChunk embeddings.
// The Phase 5 embedding pipeline checks `indexed === false` to know what
// needs (re)processing. Admin must manually trigger re-index after editing.
// ---------------------------------------------------------------------------

export async function saveAiDocument(
  documentId: string | undefined,
  rawData: AiDocumentFormValues
): Promise<{ error?: string }> {
  await requireAdminSession();

  const parsed = aiDocumentSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }

  const data = parsed.data;
  const sourceId = data.sourceId || null;

  // Parse metadata JSON string → Prisma InputJsonValue, or Prisma.JsonNull if empty.
  let metadata: Prisma.InputJsonValue | typeof Prisma.JsonNull = Prisma.JsonNull;
  if (data.metadata) {
    try {
      metadata = JSON.parse(data.metadata) as Prisma.InputJsonValue;
    } catch {
      return { error: "Metadata deve ser JSON válido." };
    }
  }

  try {
    if (documentId) {
      await prisma.aiDocument.update({
        where: { id: documentId },
        data: {
          title: data.title,
          sourceType: data.sourceType,
          sourceId,
          locale: data.locale,
          content: data.content,
          metadata,
          // Always reset to false — content changed, embeddings are stale.
          indexed: false,
        },
      });
    } else {
      await prisma.aiDocument.create({
        data: {
          title: data.title,
          sourceType: data.sourceType,
          sourceId,
          locale: data.locale,
          content: data.content,
          metadata,
          indexed: false,
        },
      });
    }
  } catch (err) {
    console.error("saveAiDocument error:", err);
    return { error: "Erro ao salvar documento. Tente novamente." };
  }

  revalidatePath("/admin/ai-documents");
  redirect("/admin/ai-documents");
}

// ---------------------------------------------------------------------------
// deleteAiDocument
// Cascades to AiChunk rows (onDelete: Cascade in schema)
// ---------------------------------------------------------------------------

export async function deleteAiDocument(documentId: string): Promise<{ error?: string }> {
  await requireAdminSession();

  try {
    await prisma.aiDocument.delete({ where: { id: documentId } });
    revalidatePath("/admin/ai-documents");
  } catch (err) {
    console.error("deleteAiDocument error:", err);
    return { error: "Erro ao excluir documento." };
  }

  return {};
}

// ---------------------------------------------------------------------------
// reindexDocument — real pipeline: chunk + embed + pgvector insert
//
// Phase 5: calls the actual indexing pipeline (OpenAI embeddings + raw SQL
// INSERT into AiChunk). Returns chunk count on success.
//
// Note: admin re-index is intentionally manual (trigger from UI). Automated
// background re-index (e.g. cron/worker) is Phase 7 polish.
// ---------------------------------------------------------------------------

export async function reindexDocument(documentId: string): Promise<{
  error?: string;
  chunks?: number;
  ok?: boolean;
}> {
  await requireAdminSession();

  const result = await indexAiDocument(documentId);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin/ai-documents");
  return { ok: true, chunks: result.chunks };
}

// ---------------------------------------------------------------------------
// markForReindex — legacy name kept for any existing callers.
// Delegates to reindexDocument.
// ---------------------------------------------------------------------------

export async function markForReindex(documentId: string): Promise<{
  error?: string;
  chunks?: number;
  ok?: boolean;
}> {
  return reindexDocument(documentId);
}

// ---------------------------------------------------------------------------
// reindexAllPending — runs the full pipeline on every indexed=false document.
// ---------------------------------------------------------------------------

export async function reindexAllPending(): Promise<{
  error?: string;
  processed?: number;
  failed?: number;
  chunks?: number;
}> {
  await requireAdminSession();

  const result = await indexAllPendingDocuments();

  revalidatePath("/admin/ai-documents");

  if (result.failed > 0) {
    return {
      processed: result.processed,
      failed: result.failed,
      chunks: result.chunks,
      error:
        result.failed === result.processed + result.failed
          ? `Todos os ${result.failed} documentos falharam ao indexar.`
          : `${result.failed} documento(s) falharam. ${result.processed} indexados com sucesso.`,
    };
  }

  return {
    processed: result.processed,
    failed: 0,
    chunks: result.chunks,
  };
}

// ---------------------------------------------------------------------------
// markAllForReindex — legacy name, delegates to reindexAllPending.
// ---------------------------------------------------------------------------

export async function markAllForReindex(): Promise<{
  error?: string;
  count?: number;
  processed?: number;
  failed?: number;
  chunks?: number;
}> {
  await requireAdminSession();

  // First mark all indexed=true docs as pending again, then run indexing
  const updateResult = await prisma.aiDocument.updateMany({
    where: { indexed: true },
    data: { indexed: false },
  });

  if (updateResult.count === 0) {
    // Nothing was indexed, just run all pending
  }

  return reindexAllPending();
}

// ---------------------------------------------------------------------------
// syncFromEditorial — regenerates AiDocument rows from Project + published Post.
// ---------------------------------------------------------------------------

export async function syncFromEditorial(): Promise<{
  error?: string;
  projects?: number;
  posts?: number;
}> {
  await requireAdminSession();

  try {
    const result = await syncAllAiDocuments();
    revalidatePath("/admin/ai-documents");
    return result;
  } catch (err) {
    console.error("syncFromEditorial error:", err);
    return { error: "Erro ao sincronizar com projetos e posts." };
  }
}
