"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type FilterOption = {
  value: string;
  label: string;
};

interface CategoryFilterProps {
  options: FilterOption[];
  paramName?: string;
}

export function CategoryFilter({ options, paramName = "category" }: CategoryFilterProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const current = searchParams.get(paramName) ?? "all";

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(paramName);
    } else {
      params.set(paramName, value);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div
      role="group"
      aria-label="Filter by category"
      className={cn(
        // Mobile: single-row horizontal scroll, edge-to-edge via -mx-4 trick.
        // The page container has px-4, so undoing it here lets the chips scroll
        // flush with the viewport edge without revealing a cropped first chip.
        "-mx-4 flex gap-2 overflow-x-auto px-4 pb-2",
        "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        // sm+: wrap as before (no scroll, no negative margin).
        "sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0",
      )}
    >
      {options.map(({ value, label }) => {
        const isActive = current === value || (value === "all" && current === "all");
        return (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              isActive
                ? "border-primary/50 bg-primary/15 text-primary shadow-[0_0_12px_rgba(139,92,246,0.2)]"
                : "border-white/[0.1] bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground",
            )}
            aria-pressed={isActive}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
