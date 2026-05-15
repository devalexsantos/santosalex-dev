import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";

const COOKIE_NAME = "admin_session";
const COOKIE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type AdminSession = {
  authenticatedAt: number;
};

// ---------------------------------------------------------------------------
// HMAC helpers
// ---------------------------------------------------------------------------

function getSecret(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET env var is not set");
  return Buffer.from(secret, "utf-8");
}

function signPayload(payload: string): string {
  const mac = crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

/**
 * Returns the payload string if the signature is valid, or null if invalid.
 * Uses timingSafeEqual to prevent timing attacks.
 */
function verifySignature(signed: string): string | null {
  const lastDot = signed.lastIndexOf(".");
  if (lastDot === -1) return null;

  const payload = signed.slice(0, lastDot);
  const mac = signed.slice(lastDot + 1);

  const expectedMac = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");

  const macBuf = Buffer.from(mac, "utf-8");
  const expectedBuf = Buffer.from(expectedMac, "utf-8");

  if (macBuf.length !== expectedBuf.length) return null;

  try {
    const valid = crypto.timingSafeEqual(macBuf, expectedBuf);
    return valid ? payload : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compares the supplied password against ADMIN_PASSWORD using a timing-safe
 * comparison, then issues a signed session cookie on success.
 *
 * Returns true on success, false on invalid password.
 */
export async function signInAdmin(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) throw new Error("ADMIN_PASSWORD env var is not set");

  const pwdBuf = Buffer.from(password, "utf-8");
  const envBuf = Buffer.from(adminPassword, "utf-8");

  // timingSafeEqual requires equal-length buffers; pad to max length.
  const maxLen = Math.max(pwdBuf.length, envBuf.length);
  const a = Buffer.concat([pwdBuf], maxLen);
  const b = Buffer.concat([envBuf], maxLen);

  let match = false;
  try {
    match = crypto.timingSafeEqual(a, b) && pwdBuf.length === envBuf.length;
  } catch {
    match = false;
  }

  if (!match) return false;

  const session: AdminSession = { authenticatedAt: Date.now() };
  const payload = JSON.stringify(session);
  const signed = signPayload(payload);

  const jar = await cookies();
  jar.set(COOKIE_NAME, signed, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_TTL_SECONDS,
    path: "/",
  });

  return true;
}

/**
 * Clears the admin session cookie.
 */
export async function signOutAdmin(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

/**
 * Verifies the admin session cookie and returns the session payload,
 * or null if the cookie is missing or tampered with.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const cookie = jar.get(COOKIE_NAME);
  if (!cookie?.value) return null;

  const payload = verifySignature(cookie.value);
  if (!payload) return null;

  try {
    const session = JSON.parse(payload) as AdminSession;
    if (typeof session.authenticatedAt !== "number") return null;
    return session;
  } catch {
    return null;
  }
}

/**
 * Enforces admin authentication. Redirects to /admin/login if the session
 * is missing or invalid. Use this at the top of every admin Server Component.
 */
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
