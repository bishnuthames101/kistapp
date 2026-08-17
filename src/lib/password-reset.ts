import { createHash, randomBytes, timingSafeEqual } from "crypto"

/**
 * Password reset token handling.
 *
 * Replaces the previous `/forgot-password` page, which POSTed to
 * `http://127.0.0.1:8000/api/password-reset/` — a Django endpoint that no
 * longer exists. `NEXT_PUBLIC_API_URL` was never set, so in production the
 * browser tried to reach the *user's own* localhost, and the CSP
 * (`connect-src 'self'`) blocked it regardless. Anyone who forgot their
 * password was permanently locked out.
 */

/** How long a reset link stays valid. Short: this is a password change. */
export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000

/** Minimum length enforced on the new password. Matches registration. */
export const MIN_PASSWORD_LENGTH = 8

/**
 * 32 bytes of CSPRNG entropy, base64url encoded. Long enough that guessing is
 * hopeless even without the rate limit on the confirm endpoint.
 */
export function generateResetToken(): string {
  return randomBytes(32).toString("base64url")
}

/**
 * Tokens are looked up by hash, never stored raw. SHA-256 (not bcrypt) is the
 * right choice here: the input is already high-entropy random, so there is
 * nothing to slow-hash against, and we need a deterministic value to index.
 */
export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

/**
 * Constant-time comparison for hex digests, so a lookup that ever compares in
 * application code cannot leak the token through timing.
 */
export function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"))
}

export function resetTokenExpiry(now: Date = new Date()): Date {
  return new Date(now.getTime() + RESET_TOKEN_TTL_MS)
}

/**
 * A token is usable only if it exists, has not been redeemed, and has not
 * expired. Kept as a pure function so it can be unit-tested without a database.
 */
export function isResetTokenUsable(
  token: { expiresAt: Date; usedAt: Date | null } | null,
  now: Date = new Date()
): boolean {
  if (!token) return false
  if (token.usedAt !== null) return false
  return token.expiresAt.getTime() > now.getTime()
}

export function buildResetUrl(baseUrl: string, token: string): string {
  return `${baseUrl.replace(/\/$/, "")}/reset-password/${encodeURIComponent(token)}`
}
