interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipBuckets = new Map<string, RateLimitRecord>();

// Clean up stale rate-limit records every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipBuckets.entries()) {
      if (record.resetAt <= now) {
        ipBuckets.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
  if (timer && typeof timer === "object" && "unref" in timer) {
    (timer as any).unref();
  }
}

/**
 * Sliding window rate limiter per client IP.
 * @param ip Client IP address
 * @param limit Max allowed requests within window
 * @param windowMs Time window in milliseconds (default 5 minutes)
 */
export function checkRateLimit(
  ip: string,
  limit: number = 20,
  windowMs: number = 5 * 60 * 1000
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const record = ipBuckets.get(ip);

  if (!record || record.resetAt <= now) {
    ipBuckets.set(ip, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: limit - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetInSeconds: Math.ceil((record.resetAt - now) / 1000),
  };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return headers.get("x-real-ip") || "127.0.0.1";
}
