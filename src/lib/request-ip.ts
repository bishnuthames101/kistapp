/**
 * One place that decides which header carries the real client IP.
 *
 * This used to be copy-pasted as
 *   `req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous"`
 * in four files. `x-forwarded-for` is client-supplied unless a trusted proxy
 * overwrites it, so on any host that does not overwrite it an attacker can put
 * a fresh fake IP on every request and walk straight through the 5-attempts-
 * per-15-minutes brute-force limit on login.
 *
 * `x-vercel-forwarded-for` is set by Vercel's edge and is not forwardable from
 * the outside, so it is preferred where present. If you move off Vercel, add
 * your platform's equivalent trusted header to TRUSTED_HEADERS *above*
 * x-forwarded-for and make sure the proxy strips inbound copies of it.
 */

/** In precedence order: the first header present wins. */
const TRUSTED_HEADERS = [
  // Vercel edge — not spoofable by the client.
  "x-vercel-forwarded-for",
  // Cloudflare, if it is ever put in front.
  "cf-connecting-ip",
  // Set by most reverse proxies to the single immediate peer.
  "x-real-ip",
] as const;

/**
 * Returns a stable identifier for the caller, or "anonymous" when no header
 * yields one. "anonymous" buckets all such callers together, which is the safe
 * direction to fail: they share one limit rather than each getting their own.
 */
export function getClientIp(req: { headers: Headers }): string {
  for (const header of TRUSTED_HEADERS) {
    const value = req.headers.get(header)?.split(",")[0]?.trim();
    if (value) return value;
  }

  // Last resort. Left-most entry is the original client when a trusted proxy
  // appends; treat it as best-effort only.
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;

  return "anonymous";
}

/**
 * Rate-limit bucket key. Authenticated callers are bucketed per user so that
 * many patients behind one clinic NAT do not starve each other.
 */
export function rateLimitIdentifier(
  req: { headers: Headers },
  userId?: string | null
): string {
  return userId ? `user:${userId}` : `ip:${getClientIp(req)}`;
}
