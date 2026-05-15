"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { reindexAllPending } from "./_actions";
import { cn } from "@/lib/utils";

export function ReindexAllButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      toast.loading("Indexando documentos pendentes...", { id: "reindex-all" });

      const result = await reindexAllPending();

      if (result.error && result.processed === 0) {
        toast.error(result.error, { id: "reindex-all" });
        return;
      }

      if (result.processed === 0 && result.failed === 0) {
        toast.info("Nenhum documento pendente encontrado.", { id: "reindex-all" });
      } else if (result.error) {
        toast.warning(
          `${result.processed} indexado(s) · ${result.failed} falha(s) · ${result.chunks ?? 0} chunks gerados`,
          { id: "reindex-all" }
        );
      } else {
        toast.success(
          `${result.processed} documento(s) indexado(s) · ${result.chunks ?? 0} chunks gerados`,
          { id: "reindex-all" }
        );
      }

      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      title="Executa chunking + embeddings OpenAI + inserção no pgvector para todos os documentos pendentes."
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-sm font-medium text-white/60 transition-colors",
        isPending ? "opacity-50 cursor-not-allowed" : "hover:border-violet-500/30 hover:bg-violet-500/5 hover:text-violet-400"
      )}
    >
      <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
      {isPending ? "Indexando..." : "Indexar pendentes"}
    </button>
  );
}
