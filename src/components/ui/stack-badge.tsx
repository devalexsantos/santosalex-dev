import { cn } from "@/lib/utils";

type BadgeCategory =
  | "frontend"
  | "backend"
  | "database"
  | "ai"
  | "devops"
  | "infra"
  | "automation"
  | "payments"
  | "email"
  | "testing"
  | "other";

interface StackBadgeProps {
  name: string;
  category?: BadgeCategory;
  icon?: React.ReactNode;
  className?: string;
}

const categoryColors: Record<BadgeCategory, string> = {
  frontend:   "bg-blue-500/10   text-blue-300   border-blue-500/20",
  backend:    "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  database:   "bg-amber-500/10  text-amber-300   border-amber-500/20",
  ai:         "bg-violet-500/10 text-violet-300  border-violet-500/20",
  devops:     "bg-orange-500/10 text-orange-300  border-orange-500/20",
  infra:      "bg-sky-500/10    text-sky-300     border-sky-500/20",
  automation: "bg-pink-500/10   text-pink-300    border-pink-500/20",
  payments:   "bg-green-500/10  text-green-300   border-green-500/20",
  email:      "bg-rose-500/10   text-rose-300    border-rose-500/20",
  testing:    "bg-yellow-500/10 text-yellow-300  border-yellow-500/20",
  other:      "bg-white/5       text-muted-foreground border-white/10",
};

export function StackBadge({ name, category = "other", icon, className }: StackBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "text-xs font-medium leading-none",
        "transition-colors duration-150",
        categoryColors[category],
        className,
      )}
    >
      {icon && <span className="shrink-0 text-[10px]">{icon}</span>}
      {name}
    </span>
  );
}
