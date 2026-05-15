"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const localeLabels: Record<string, string> = {
    "pt-BR": "PT",
    en: "EN",
  };

  function switchLocale(nextLocale: string) {
    if (nextLocale === locale) return;

    // Persist preference in cookie that next-intl reads
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;

    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <div
      className="flex items-center rounded-full border border-white/10 bg-white/[0.04] p-0.5"
      role="group"
      aria-label="Language switcher"
    >
      {routing.locales.map((loc) => {
        const isActive = loc === locale;
        return (
          <button
            key={loc}
            onClick={() => switchLocale(loc)}
            disabled={isPending}
            aria-label={`Switch to ${loc === "pt-BR" ? "Portuguese" : "English"}`}
            aria-pressed={isActive}
            className={cn(
              "min-w-[36px] rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200",
              isActive
                ? "bg-primary text-white shadow-sm shadow-primary/30"
                : "text-muted-foreground hover:text-foreground",
              isPending && "cursor-wait opacity-60",
            )}
          >
            {localeLabels[loc]}
          </button>
        );
      })}
    </div>
  );
}
