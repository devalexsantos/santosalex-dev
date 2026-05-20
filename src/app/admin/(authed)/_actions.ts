"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/admin-session";

// Public routes expressed as ROUTE TEMPLATES (with the `[locale]` dynamic
// segment). Passing the bracketed template + "page" scope revalidates every
// resolved instance (/pt-BR/stack AND /en/stack), which the resolved-value
// form (/pt-BR/stack) does not reliably do for dynamic segments.
const PUBLIC_ROUTES = [
  "/[locale]",
  "/[locale]/projects",
  "/[locale]/projects/[slug]",
  "/[locale]/stack",
  "/[locale]/about",
  "/[locale]/build-notes",
  "/[locale]/build-notes/[slug]",
  "/[locale]/recruiter",
  "/[locale]/contact",
  "/[locale]/how-i-build",
];

/**
 * Forces ISR regeneration of every public page in both locales.
 *
 * Useful after a fresh deploy or a bulk data import: the Docker build
 * prerenders pages against a placeholder DB (no data), so the static output is
 * empty until the ISR window elapses. This revalidates everything on demand.
 */
export async function revalidateSite(): Promise<
  { ok: true; count: number } | { ok: false; error: string }
> {
  await requireAdminSession();

  try {
    // Broad sweep: invalidates the whole route cache.
    revalidatePath("/", "layout");

    // Explicit per-route revalidation using bracket templates.
    for (const route of PUBLIC_ROUTES) {
      revalidatePath(route, "page");
    }

    console.log(
      `[revalidateSite] revalidated "/" (layout) + ${PUBLIC_ROUTES.length} route templates @ ${new Date().toISOString()}`
    );
    return { ok: true, count: PUBLIC_ROUTES.length };
  } catch (err) {
    console.error("[revalidateSite] failed:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao revalidar.",
    };
  }
}
