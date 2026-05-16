/**
 * Canonical site URL helpers.
 *
 * Reads APP_URL (existing env, set in docker-compose and EasyPanel). Strips
 * the trailing slash so callers can safely do `${siteUrl}/foo` without
 * producing `//foo` URLs that some crawlers treat as different paths.
 */

export function getSiteUrl(): string {
  const raw = process.env.APP_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path.startsWith("/")) return `${base}/${path}`;
  return `${base}${path}`;
}
