"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface LocaleSwitcherProps {
  /**
   * Optional per-locale pathname overrides.
   * When provided (e.g. on post detail pages where slugs differ per locale),
   * `router.push` navigates to the override path instead of the current pathname.
   * If an override is `null`, that locale button is disabled (translation unavailable).
   */
  pathnameOverrides?: Partial<Record<Locale, string | null>>;
}

export function LocaleSwitcher({ pathnameOverrides }: LocaleSwitcherProps = {}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const localeLabels: Record<string, string> = {
    "pt-BR": "PT",
    en: "EN",
  };

  function switchLocale(nextLocale: Locale) {
    if (nextLocale === locale) return;

    // Persist preference in cookie that next-intl reads
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;

    const override = pathnameOverrides?.[nextLocale];

    startTransition(() => {
      if (override !== undefined) {
        // Use push so the user can navigate back; override is already locale-relative
        router.push(override as Parameters<typeof router.push>[0], { locale: nextLocale });
      } else {
        router.replace(pathname, { locale: nextLocale });
      }
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
        const override = pathnameOverrides?.[loc];
        // Disable when override is explicitly null (sibling post does not exist)
        const isDisabled = isPending || override === null;

        return (
          <button
            key={loc}
            onClick={() => switchLocale(loc)}
            disabled={isDisabled}
            aria-label={`Switch to ${loc === "pt-BR" ? "Portuguese" : "English"}`}
            aria-pressed={isActive}
            className={cn(
              "min-w-[36px] rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200",
              isActive
                ? "bg-primary text-white shadow-sm shadow-primary/30"
                : "text-muted-foreground hover:text-foreground",
              isDisabled && "cursor-not-allowed opacity-40",
            )}
          >
            {localeLabels[loc]}
          </button>
        );
      })}
    </div>
  );
}
