"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { aiDocumentSchema, type AiDocumentFormValues } from "@/lib/validators/ai-document";

// ---------------------------------------------------------------------------
// saveAiDocument — create or update
//
// IMPORTANT: Every save sets `indexed = false`.
// Rationale: any content change invalidates existing AiChunk embeddings.
// The Phase 5 embedding pipeline checks `indexed === false` to know what
// needs (re)processing. Even before Phase 5 is built, the flag must be
// accurate so the queue is correct when the pipeline runs.
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
  // Prisma's nullable Json field requires Prisma.JsonNull (not native null) for SQL NULL.
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
          // Phase 5 pipeline will re-chunk and re-embed when it sees indexed=false.
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
          indexed: false, // New document — not yet embedded
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
// markForReindex — sets indexed=false for a single document
//
// STUB: This is a Phase 5 preparation action. It only toggles the indexed flag.
// It does NOT call OpenAI, does NOT write AiChunk rows, does NOT run any
// embedding pipeline. The actual embedding pipeline will be implemented in
// Phase 5 (RAG). Marking as false here ensures the document is in the
// correct queue when Phase 5 runs.
// ---------------------------------------------------------------------------

export async function markForReindex(documentId: string): Promise<{ error?: string }> {
  await requireAdminSession();

  try {
    await prisma.aiDocument.update({
      where: { id: documentId },
      data: { indexed: false },
    });
    revalidatePath("/admin/ai-documents");
  } catch (err) {
    console.error("markForReindex error:", err);
    return { error: "Erro ao marcar para re-indexação." };
  }

  return {};
}

// ---------------------------------------------------------------------------
// markAllForReindex — bulk version of markForReindex
//
// STUB: Same caveat as above — only flips the flag. No embedding calls.
// ---------------------------------------------------------------------------

export async function markAllForReindex(): Promise<{ error?: string; count?: number }> {
  await requireAdminSession();

  try {
    const result = await prisma.aiDocument.updateMany({
      where: { indexed: true },
      data: { indexed: false },
    });
    revalidatePath("/admin/ai-documents");
    return { count: result.count };
  } catch (err) {
    console.error("markAllForReindex error:", err);
    return { error: "Erro ao marcar documentos para re-indexação." };
  }
}
