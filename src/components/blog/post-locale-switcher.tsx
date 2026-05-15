"use client";

/**
 * PostLocaleSwitcher
 *
 * A locale switcher rendered inside the post detail header that navigates
 * to the sibling post's locale-specific slug when available.
 *
 * Design decision: The Navbar's global LocaleSwitcher is hidden on
 * `/build-notes/[slug]` pages via the `hideNavbarSwitcher` context
 * (see NavbarSwitcherContext). This component takes over and renders
 * in the post article header with full slug-aware navigation.
 *
 * If the sibling post doesn't exist (siblingSlug is null), the other locale
 * button is grayed out and non-interactive.
 */

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import type { Locale } from "@/i18n/routing";

interface PostLocaleSwitcherProps {
  currentLocale: Locale;
  /** Sibling post's slug in the other locale, or null if no translation exists */
  siblingLocale: Locale;
  siblingSlug: string | null;
}

export function PostLocaleSwitcher({
  siblingLocale,
  siblingSlug,
}: PostLocaleSwitcherProps) {
  const overrides: Partial<Record<Locale, string | null>> = {
    [siblingLocale]: siblingSlug ? `/build-notes/${siblingSlug}` : null,
  };

  return <LocaleSwitcher pathnameOverrides={overrides} />;
}
