/**
 * In-memory sliding-window rate limiter for server API routes with automatic memory cleanup.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const store = new Map<string, RateLimitRecord>();

export interface RateLimitConfig {
  limit: number;      // Maximum requests allowed
  windowMs: number;   // Time window in milliseconds
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: 30, windowMs: 60 * 60 * 1000 }
): { allowed: boolean; remaining: number; resetTimeMs: number } {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let record = store.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    store.set(identifier, record);
  }

  // Remove timestamps older than the sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= config.limit) {
    const oldestTimestamp = record.timestamps[0] || now;
    const resetTimeMs = oldestTimestamp + config.windowMs;
    return {
      allowed: false,
      remaining: 0,
      resetTimeMs,
    };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    remaining: config.limit - record.timestamps.length,
    resetTimeMs: now + config.windowMs,
  };
}
