import { describe, it, expect } from "vitest";
import {
  RESET_TOKEN_TTL_MS,
  buildResetUrl,
  generateResetToken,
  hashResetToken,
  isResetTokenUsable,
  resetTokenExpiry,
  safeEqualHex,
} from "@/lib/password-reset";
import { BCRYPT_COST, bcryptCost, needsRehash, DUMMY_PASSWORD_HASH } from "@/lib/password";

describe("reset token generation", () => {
  it("produces URL-safe tokens with no padding", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateResetToken()).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });

  it("does not repeat", () => {
    const tokens = new Set(Array.from({ length: 500 }, generateResetToken));
    expect(tokens.size).toBe(500);
  });

  it("survives a round trip through a URL path segment", () => {
    const token = generateResetToken();
    const url = buildResetUrl("https://example.com", token);
    const segment = new URL(url).pathname.split("/").pop()!;
    expect(decodeURIComponent(segment)).toBe(token);
  });

  it("does not double up slashes when the base URL has a trailing one", () => {
    expect(buildResetUrl("https://example.com/", "abc")).toBe(
      "https://example.com/reset-password/abc"
    );
  });
});

describe("reset token hashing", () => {
  it("is deterministic and 64 hex characters", () => {
    const token = generateResetToken();
    expect(hashResetToken(token)).toBe(hashResetToken(token));
    expect(hashResetToken(token)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("never returns the raw token — a database dump must not be usable", () => {
    const token = generateResetToken();
    expect(hashResetToken(token)).not.toBe(token);
  });

  it("separates distinct tokens", () => {
    expect(hashResetToken("a")).not.toBe(hashResetToken("b"));
  });
});

describe("safeEqualHex", () => {
  it("matches identical digests", () => {
    const digest = hashResetToken("x");
    expect(safeEqualHex(digest, digest)).toBe(true);
  });

  it("rejects different digests and different lengths without throwing", () => {
    expect(safeEqualHex(hashResetToken("a"), hashResetToken("b"))).toBe(false);
    expect(safeEqualHex("abcd", "ab")).toBe(false);
  });
});

describe("isResetTokenUsable", () => {
  const now = new Date(2026, 7, 10, 12, 0);
  const future = new Date(now.getTime() + 60_000);
  const past = new Date(now.getTime() - 60_000);

  it("accepts a fresh, unused token", () => {
    expect(isResetTokenUsable({ expiresAt: future, usedAt: null }, now)).toBe(true);
  });

  it("rejects an expired token", () => {
    expect(isResetTokenUsable({ expiresAt: past, usedAt: null }, now)).toBe(false);
  });

  it("rejects a token that was already redeemed — single use", () => {
    expect(isResetTokenUsable({ expiresAt: future, usedAt: past }, now)).toBe(false);
  });

  it("rejects a missing token", () => {
    expect(isResetTokenUsable(null, now)).toBe(false);
  });

  it("rejects a token expiring exactly now", () => {
    expect(isResetTokenUsable({ expiresAt: now, usedAt: null }, now)).toBe(false);
  });
});

describe("resetTokenExpiry", () => {
  it("is the configured TTL ahead of the given time", () => {
    const now = new Date(2026, 7, 10, 12, 0);
    expect(resetTokenExpiry(now).getTime() - now.getTime()).toBe(RESET_TOKEN_TTL_MS);
  });

  it("is short — this is a password change, not a session", () => {
    expect(RESET_TOKEN_TTL_MS).toBeLessThanOrEqual(60 * 60 * 1000);
  });
});

describe("password hashing policy", () => {
  it("parses the cost out of a bcrypt hash", () => {
    expect(bcryptCost("$2b$12$abcdefghijklmnopqrstuv")).toBe(12);
    expect(bcryptCost("$2a$10$abcdefghijklmnopqrstuv")).toBe(10);
    expect(bcryptCost("not-a-hash")).toBeNull();
  });

  it("flags the legacy cost-10 hashes for upgrade on next login", () => {
    expect(needsRehash("$2a$10$abcdefghijklmnopqrstuv")).toBe(true);
    expect(needsRehash(`$2b$${BCRYPT_COST}$abcdefghijklmnopqrstuv`)).toBe(false);
  });

  it("does not flag an unparseable hash, so a bad row cannot loop", () => {
    expect(needsRehash("garbage")).toBe(false);
  });

  it("keeps the anti-enumeration dummy hash at the real work factor", () => {
    // A mismatched cost would reintroduce exactly the timing difference the
    // dummy hash exists to hide.
    expect(bcryptCost(DUMMY_PASSWORD_HASH)).toBe(BCRYPT_COST);
  });
});
