import { describe, it, expect } from "vitest";
import { MemoryLimiter, getRateLimitHeaders } from "@/lib/ratelimit";
import { getClientIp, rateLimitIdentifier } from "@/lib/request-ip";

/**
 * The in-memory fallback is what keeps some brute-force protection when Upstash
 * is unreachable. Previously an Upstash outage returned 500 from the login
 * endpoint (taking login down clinic-wide) while leaving the rest of the API
 * completely unlimited.
 */
describe("MemoryLimiter", () => {
  it("allows exactly `max` requests then blocks", () => {
    const limiter = new MemoryLimiter(3, 60_000);

    expect(limiter.limit("a").success).toBe(true);
    expect(limiter.limit("a").success).toBe(true);
    expect(limiter.limit("a").success).toBe(true);
    expect(limiter.limit("a").success).toBe(false);
  });

  it("counts each identifier separately", () => {
    const limiter = new MemoryLimiter(1, 60_000);

    expect(limiter.limit("a").success).toBe(true);
    expect(limiter.limit("a").success).toBe(false);
    // A different patient must not be starved by the first one.
    expect(limiter.limit("b").success).toBe(true);
  });

  it("reports remaining and never goes negative", () => {
    const limiter = new MemoryLimiter(2, 60_000);

    expect(limiter.limit("a").remaining).toBe(1);
    expect(limiter.limit("a").remaining).toBe(0);
    expect(limiter.limit("a").remaining).toBe(0);
  });

  it("resets after the window elapses", async () => {
    const limiter = new MemoryLimiter(1, 20);

    expect(limiter.limit("a").success).toBe(true);
    expect(limiter.limit("a").success).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(limiter.limit("a").success).toBe(true);
  });

  it("returns a reset timestamp in the future", () => {
    const result = new MemoryLimiter(1, 60_000).limit("a");
    expect(result.reset).toBeGreaterThan(Date.now());
  });
});

describe("getRateLimitHeaders", () => {
  it("never emits a negative Retry-After", () => {
    // A reset already in the past would otherwise produce "Retry-After: -12",
    // which clients treat as garbage.
    const headers = getRateLimitHeaders(60, 0, Date.now() - 10_000);
    expect(Number(headers["Retry-After"])).toBeGreaterThanOrEqual(0);
  });

  it("reports limit and remaining as strings", () => {
    const headers = getRateLimitHeaders(60, 7, Date.now() + 1000);
    expect(headers["X-RateLimit-Limit"]).toBe("60");
    expect(headers["X-RateLimit-Remaining"]).toBe("7");
  });
});

describe("getClientIp", () => {
  const req = (headers: Record<string, string>) => ({ headers: new Headers(headers) });

  it("prefers the Vercel header, which a client cannot forge", () => {
    expect(
      getClientIp(
        req({
          // An attacker rotating this value would otherwise get a fresh
          // login-attempt budget on every request.
          "x-forwarded-for": "1.2.3.4",
          "x-vercel-forwarded-for": "9.9.9.9",
        })
      )
    ).toBe("9.9.9.9");
  });

  it("falls back through the trusted headers in order", () => {
    expect(getClientIp(req({ "cf-connecting-ip": "8.8.8.8" }))).toBe("8.8.8.8");
    expect(getClientIp(req({ "x-real-ip": "7.7.7.7" }))).toBe("7.7.7.7");
  });

  it("uses the left-most x-forwarded-for entry as a last resort", () => {
    expect(getClientIp(req({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }))).toBe("1.2.3.4");
  });

  it("buckets callers together rather than handing each its own limit", () => {
    expect(getClientIp(req({}))).toBe("anonymous");
    // An empty header must not read as a distinct identity.
    expect(getClientIp(req({ "x-forwarded-for": "" }))).toBe("anonymous");
  });
});

describe("rateLimitIdentifier", () => {
  const req = { headers: new Headers({ "x-real-ip": "1.1.1.1" }) };

  it("buckets authenticated callers per user, not per IP", () => {
    // Many patients share one clinic NAT; per-IP would starve them all.
    expect(rateLimitIdentifier(req, "user_123")).toBe("user:user_123");
  });

  it("falls back to the IP when anonymous", () => {
    expect(rateLimitIdentifier(req, null)).toBe("ip:1.1.1.1");
    expect(rateLimitIdentifier(req)).toBe("ip:1.1.1.1");
  });
});
