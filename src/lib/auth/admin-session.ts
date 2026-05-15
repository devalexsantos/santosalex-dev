import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";

export type AdminSession = {
  authenticatedAt: number;
};

/**
 * Validates the password against ADMIN_PASSWORD env var and issues a session cookie.
 * Full HMAC-signed implementation lands in Phase 4.
 */
export async function signInAdmin(_password: string): Promise<void> {
  throw new Error("signInAdmin: not implemented yet (Phase 4)");
}

export async function signOutAdmin(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  if (!jar.get(COOKIE_NAME)) return null;
  return null;
}
