"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { syncFromEditorial } from "./_actions";
import { cn } from "@/lib/utils";

export function SyncFromEditorialButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await syncFromEditorial();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      const p = result.projects ?? 0;
      const po = result.posts ?? 0;
      toast.success(
        `Sincronizado: ${p} projeto${p !== 1 ? "s" : ""} (${p * 2} docs) + ${po} post${po !== 1 ? "s" : ""}.`,
      );
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      title="Regenera os AiDocuments a partir dos projetos e dos posts publicados. Idempotente — pode rodar quantas vezes quiser."
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-sm font-medium text-white/60 transition-colors",
        isPending
          ? "cursor-not-allowed opacity-50"
          : "hover:border-violet-500/20 hover:bg-violet-500/5 hover:text-violet-400",
      )}
    >
      <Sparkles className={cn("h-4 w-4", isPending && "animate-pulse")} />
      {isPending ? "Sincronizando..." : "Sincronizar de projetos/posts"}
    </button>
  );
}
