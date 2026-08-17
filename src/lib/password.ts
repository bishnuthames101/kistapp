import bcrypt from "bcryptjs"

/**
 * One definition of how passwords are hashed.
 *
 * This used to be `bcrypt.hash(password, 10)` inline in the register route and
 * nowhere else, because nothing else ever changed a password.
 */

/**
 * bcrypt work factor. 12 is ~250ms on the current runtime — slow enough to make
 * offline cracking expensive, fast enough not to be a login DoS.
 *
 * Existing accounts were hashed at cost 10. `needsRehash` + the rehash-on-login
 * path in the credentials provider migrate them on next successful login, so
 * the corpus converges on 12 without forcing a password reset on anyone.
 */
export const BCRYPT_COST = 12

/**
 * A real bcrypt hash, at BCRYPT_COST, of a random value nobody knows.
 *
 * Used to burn equivalent CPU when a login is attempted against a phone number
 * that has no account. Without it, "unknown phone" returns in about a
 * millisecond while "known phone, wrong password" takes ~250ms, and that gap
 * alone lets anyone enumerate which phone numbers belong to patients here.
 *
 * It must stay at BCRYPT_COST: a mismatched cost reintroduces exactly the
 * timing difference it exists to hide.
 */
export const DUMMY_PASSWORD_HASH =
  "$2b$12$qh0g/5lddIJoW78Xez0fw.BRHFbazCkxWs4tuoWP2xTDHGBO6Ytjm"

export function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, BCRYPT_COST)
}

export function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash)
}

/**
 * Burns the same time as a real verification, then fails. Call this on the
 * "no such user" branch so both branches cost the same.
 */
export async function fakeVerifyPassword(plaintext: string): Promise<void> {
  await bcrypt.compare(plaintext, DUMMY_PASSWORD_HASH)
}

/** True when a stored hash was produced with a weaker cost than we now use. */
export function needsRehash(hash: string): boolean {
  const cost = bcryptCost(hash)
  return cost !== null && cost < BCRYPT_COST
}

/** Parses the cost out of a `$2b$12$...` modular-crypt hash. */
export function bcryptCost(hash: string): number | null {
  const match = /^\$2[aby]\$(\d{2})\$/.exec(hash)
  return match ? parseInt(match[1], 10) : null
}
