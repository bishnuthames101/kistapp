import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

/**
 * Rate limiting, with a fallback for when Upstash is unreachable.
 *
 * The problem this solves: the middleware limiter was wrapped in try/catch and
 * deliberately failed open (a dropped limit is cheaper than a dead clinic API),
 * but the login limiter was NOT, so an Upstash outage returned 500 from
 * `/api/auth/callback/credentials` and took login down entirely — while
 * leaving the rest of the API unlimited. Exactly backwards.
 *
 * Now every caller goes through `checkLimit`, which fails over to a per-
 * instance in-memory limiter instead of throwing. That is weaker than Redis
 * (serverless runs many instances, and each keeps its own counters, so the
 * effective limit is roughly `limit x instances`) but it still stops a single
 * client hammering one instance, and it never takes the clinic offline.
 */

const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

// Constructing the client with undefined credentials throws at import time,
// which would take down every route that imports this module. A missing
// credential is a deploy mistake, not a reason to 500 the whole site.
const redis =
  redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null

if (!redis) {
  console.warn(
    "[ratelimit] UPSTASH_REDIS_REST_URL / _TOKEN not set. " +
      "Falling back to per-instance in-memory limits."
  )
}

function upstash(limit: number, window: Parameters<typeof Ratelimit.slidingWindow>[1], prefix: string) {
  if (!redis) return null
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix,
  })
}

/* -------------------------------------------------------------------------- */
/*                          In-memory fallback limiter                        */
/* -------------------------------------------------------------------------- */

type Bucket = { count: number; resetAt: number }

/**
 * Fixed-window counter. Coarser than the sliding window Upstash gives us, but
 * this only runs while Redis is down and it must stay cheap and allocation-free.
 */
class MemoryLimiter {
  private buckets = new Map<string, Bucket>()

  constructor(
    private readonly max: number,
    private readonly windowMs: number
  ) {}

  limit(identifier: string) {
    const now = Date.now()
    let bucket = this.buckets.get(identifier)

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + this.windowMs }
      this.buckets.set(identifier, bucket)
    }

    bucket.count += 1

    // Bound memory. Only sweeps once the map is large, so the common path
    // stays O(1).
    if (this.buckets.size > 10_000) {
      for (const [key, value] of this.buckets) {
        if (value.resetAt <= now) this.buckets.delete(key)
      }
    }

    return {
      success: bucket.count <= this.max,
      limit: this.max,
      remaining: Math.max(0, this.max - bucket.count),
      reset: bucket.resetAt,
    }
  }
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE

/* -------------------------------------------------------------------------- */
/*                                  Limiters                                  */
/* -------------------------------------------------------------------------- */

export type LimiterPair = {
  primary: Ratelimit | null
  fallback: MemoryLimiter
  name: string
}

/** 5 attempts per 15 minutes (login / register). */
export const authLimiter: LimiterPair = {
  primary: upstash(5, "15 m", "rl:auth"),
  fallback: new MemoryLimiter(5, 15 * MINUTE),
  name: "auth",
}

/** 60 requests per minute (general API surface, applied in middleware). */
export const apiLimiter: LimiterPair = {
  primary: upstash(60, "1 m", "rl:api"),
  fallback: new MemoryLimiter(60, MINUTE),
  name: "api",
}

/** 20 uploads per hour per user (uploads are expensive and land in storage). */
export const uploadLimiter: LimiterPair = {
  primary: upstash(20, "1 h", "rl:upload"),
  fallback: new MemoryLimiter(20, HOUR),
  name: "upload",
}

/**
 * 3 password-reset requests per hour. Deliberately tighter than auth: every
 * request sends an email, so a loose limit here is both a mail-reputation
 * problem and a way to spam a patient's inbox.
 */
export const passwordResetLimiter: LimiterPair = {
  primary: upstash(3, "1 h", "rl:pwreset"),
  fallback: new MemoryLimiter(3, HOUR),
  name: "password-reset",
}

/** 10 reset-token confirmations per hour, to slow token brute-forcing. */
export const passwordResetConfirmLimiter: LimiterPair = {
  primary: upstash(10, "1 h", "rl:pwreset-confirm"),
  fallback: new MemoryLimiter(10, HOUR),
  name: "password-reset-confirm",
}

/* -------------------------------------------------------------------------- */
/*                                   Check                                    */
/* -------------------------------------------------------------------------- */

export type LimitResult = {
  success: boolean
  limit: number
  remaining: number
  reset: number
  /** True when Redis was unavailable and the in-memory fallback answered. */
  degraded: boolean
}

/**
 * Never throws. Callers can treat the result as authoritative without their
 * own try/catch.
 */
export async function checkLimit(
  limiter: LimiterPair,
  identifier: string
): Promise<LimitResult> {
  if (limiter.primary) {
    try {
      const result = await limiter.primary.limit(identifier)
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
        degraded: false,
      }
    } catch (err) {
      console.error(
        `[ratelimit] ${limiter.name} limiter unavailable, using in-memory fallback:`,
        err
      )
    }
  }

  return { ...limiter.fallback.limit(identifier), degraded: true }
}

export function getRateLimitHeaders(
  limit: number,
  remaining: number,
  reset: number
): Record<string, string> {
  return {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": reset.toString(),
    "Retry-After": Math.max(0, Math.ceil((reset - Date.now()) / 1000)).toString(),
  }
}

/** Shared 429 response so the shape is identical everywhere. */
export function tooManyRequests(result: LimitResult, message: string) {
  return Response.json(
    { error: message },
    {
      status: 429,
      headers: getRateLimitHeaders(result.limit, result.remaining, result.reset),
    }
  )
}

// Exported for tests.
export { MemoryLimiter }
