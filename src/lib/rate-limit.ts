import { redis } from "./redis";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
};

export type RateLimitOptions = {
  key: string;
  limit: number;
  windowSeconds: number;
};

/**
 * Token-bucket-ish counter using Redis INCR + EXPIRE.
 * Implementation lands in Phase 5 alongside the chat API.
 */
export async function checkRateLimit(
  _options: RateLimitOptions,
): Promise<RateLimitResult> {
  void redis;
  throw new Error("rate-limit: not implemented yet (Phase 5)");
}
