"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { revalidateSite } from "./_actions";

export function RevalidateButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await revalidateSite();
          if (result.ok) {
            toast.success("Cache do site revalidado. As páginas públicas vão refletir os dados atuais.");
          } else {
            toast.error(result.error);
          }
        })
      }
      className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-emerald-500/25 hover:bg-emerald-500/5 hover:text-white disabled:opacity-60"
    >
      <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
      {isPending ? "Revalidando..." : "Revalidar cache do site"}
    </button>
  );
}
