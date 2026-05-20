"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/admin-session";

/**
 * Forces ISR regeneration of every public page in both locales.
 *
 * Useful after a fresh deploy or a bulk data import: the Docker build
 * prerenders pages against a placeholder DB (no data), so the static output is
 * empty until the ISR window elapses. This revalidates everything on demand.
 */
export async function revalidateSite(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  await requireAdminSession();

  try {
    for (const locale of ["pt-BR", "en"]) {
      // "layout" scope revalidates the locale layout and every nested page
      // (home, projects, stack, about, build-notes, …).
      revalidatePath(`/${locale}`, "layout");
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao revalidar.",
    };
  }
}
