import { cn } from "@/lib/utils";

export type TranslationStatus = "draft" | "needs_translation" | "translated" | "reviewed";

const config: Record<
  TranslationStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Rascunho",
    className: "bg-white/[0.05] text-white/40",
  },
  needs_translation: {
    label: "Tradução desatualizada",
    className: "bg-amber-500/10 text-amber-400",
  },
  translated: {
    label: "Traduzido (não revisado)",
    className: "bg-blue-500/10 text-blue-400",
  },
  reviewed: {
    label: "Revisado",
    className: "bg-emerald-500/10 text-emerald-400",
  },
};

interface TranslationStatusBadgeProps {
  status: TranslationStatus;
  className?: string;
}

export function TranslationStatusBadge({
  status,
  className,
}: TranslationStatusBadgeProps) {
  const { label, className: colorClass } = config[status] ?? config.draft;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
}
