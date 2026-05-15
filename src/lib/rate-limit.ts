/**
 * Redis-backed sliding-window rate limiter.
 *
 * Strategy: fixed window using INCR + EXPIRE.
 * Key shape: rl:{key}:{epoch_bucket}
 * Bucket: Math.floor(Date.now() / (windowSeconds * 1000))
 *
 * On first INCR (result === 1), set EXPIRE to windowSeconds * 2 so the key
 * automatically cleans up well after the window closes.
 *
 * Uses a Redis multi() pipeline to perform INCR + EXPIRE in a single round-trip
 * when possible (two sequential commands — not truly atomic, but safe for a
 * rate-limiting use case where occasional off-by-one is acceptable).
 */

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

export async function checkRateLimit({
  key,
  limit,
  windowSeconds,
}: RateLimitOptions): Promise<RateLimitResult> {
  const now = Date.now();
  const bucket = Math.floor(now / (windowSeconds * 1000));
  const redisKey = `rl:${key}:${bucket}`;

  // Use pipeline: INCR then conditionally EXPIRE
  const pipeline = redis.pipeline();
  pipeline.incr(redisKey);
  // We always set EXPIRE — if key already exists, this refreshes the TTL
  // to windowSeconds*2 which is fine (it just extends cleanup window slightly).
  pipeline.expire(redisKey, windowSeconds * 2);
  const results = await pipeline.exec();

  // INCR result is the first command's return value
  const count = (results?.[0]?.[1] as number) ?? 1;

  // resetAt = start of next bucket
  const resetAt = new Date((bucket + 1) * windowSeconds * 1000);

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt,
  };
}

// ---------------------------------------------------------------------------
// Chat-specific rate limit helpers
// ---------------------------------------------------------------------------

const CHAT_MINUTE_LIMIT = Number(process.env.CHAT_MINUTE_LIMIT ?? 10);
const CHAT_DAILY_LIMIT = Number(process.env.CHAT_DAILY_LIMIT ?? 50);

export type ChatRateLimitResult =
  | { allowed: true }
  | { allowed: false; reason: "minute" | "day"; resetAt: Date };

/**
 * Checks both per-minute and per-day rate limits for a hashed IP.
 * Returns { allowed: true } if both pass.
 * Returns { allowed: false, reason, resetAt } for the first limit hit.
 */
export async function checkChatRateLimits(
  ipHash: string,
): Promise<ChatRateLimitResult> {
  const [minuteResult, dayResult] = await Promise.all([
    checkRateLimit({
      key: `chat:min:${ipHash}`,
      limit: CHAT_MINUTE_LIMIT,
      windowSeconds: 60,
    }),
    checkRateLimit({
      key: `chat:day:${ipHash}`,
      limit: CHAT_DAILY_LIMIT,
      windowSeconds: 86400,
    }),
  ]);

  if (!minuteResult.allowed) {
    return { allowed: false, reason: "minute", resetAt: minuteResult.resetAt };
  }

  if (!dayResult.allowed) {
    return { allowed: false, reason: "day", resetAt: dayResult.resetAt };
  }

  return { allowed: true };
}
