"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { markAllForReindex } from "./_actions";
import { cn } from "@/lib/utils";

export function ReindexAllButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await markAllForReindex();
      if (result?.error) {
        toast.error(result.error);
      } else {
        const count = result.count ?? 0;
        if (count === 0) {
          toast.info("Nenhum documento indexado encontrado para marcar.");
        } else {
          toast.success(`${count} documento${count !== 1 ? "s" : ""} marcado${count !== 1 ? "s" : ""} como pendente.`);
        }
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      title="A pipeline de embeddings será executada na Fase 5. Marcar como pendente já agora deixa o documento na fila correta."
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-sm font-medium text-white/60 transition-colors",
        isPending ? "opacity-50 cursor-not-allowed" : "hover:border-amber-500/20 hover:bg-amber-500/5 hover:text-amber-400"
      )}
    >
      <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
      {isPending ? "Marcando..." : "Re-indexar todos pendentes"}
    </button>
  );
}
