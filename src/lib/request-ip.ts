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

/**
 * A header is only trustworthy if a proxy that overwrites it is actually in
 * front of this app. `cf-connecting-ip` and `x-real-ip` used to be trusted
 * unconditionally, which was worse than not trusting them at all: nothing in
 * front of this deployment sets either, so any client could send
 * `cf-connecting-ip: <anything random>` and mint itself a brand-new rate-limit
 * bucket on every single request — walking straight through the login,
 * registration and password-reset limits that the header exists to enforce.
 *
 * `x-vercel-forwarded-for` is the exception and stays unconditional: Vercel's
 * edge strips any inbound copy before setting it, so it cannot be forged from
 * outside, and it is simply absent everywhere else.
 *
 * Set `TRUSTED_PROXY_HEADER` to the header your proxy overwrites (for example
 * `cf-connecting-ip` behind Cloudflare) when you put one in front. Leave it
 * unset otherwise.
 */
const VERCEL_HEADER = "x-vercel-forwarded-for";

function trustedHeaders(): string[] {
  const configured = process.env.TRUSTED_PROXY_HEADER?.trim().toLowerCase();
  return configured ? [VERCEL_HEADER, configured] : [VERCEL_HEADER];
}

/**
 * Returns a stable identifier for the caller, or "anonymous" when no header
 * yields one. "anonymous" buckets all such callers together, which is the safe
 * direction to fail: they share one limit rather than each getting their own.
 */
export function getClientIp(req: { headers: Headers }): string {
  for (const header of trustedHeaders()) {
    const value = req.headers.get(header)?.split(",")[0]?.trim();
    if (value) return value;
  }

  // `x-forwarded-for` is NOT consulted here. It is appended to, not overwritten,
  // by most proxies, so its left-most entry is whatever the client put there —
  // which made it a free bypass of every limit keyed on this value. If your
  // proxy does overwrite it, name it in TRUSTED_PROXY_HEADER and it is used by
  // the loop above.
  //
  // Bucketing everything else together under one shared limit is the safe
  // direction to fail: worst case a handful of unidentifiable callers contend
  // for one bucket, versus every caller getting an unlimited supply of them.
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
