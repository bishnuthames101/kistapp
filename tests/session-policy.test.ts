import { describe, it, expect } from "vitest";
import {
  ACTIVITY_REFRESH_INTERVAL_MS,
  INACTIVITY_TIMEOUT_MS,
  INACTIVITY_WARNING_LEAD_MS,
  inactivityTimeoutFor,
} from "@/lib/session-policy";

/**
 * Session timeout used to be specified in three places that disagreed: a silent
 * 90s timer in AuthContext, a 90s/120s timer in InactivityMonitor, and a
 * hardcoded copy in the NextAuth jwt callback. The silent one always fired
 * first, so the warning modal was unreachable and patients were logged out
 * mid-booking with no explanation.
 *
 * These tests assert the invariants that made that bug possible, not the exact
 * durations — those are a product decision and may change.
 */
describe("inactivityTimeoutFor", () => {
  it("gives staff a shorter window than patients", () => {
    // Staff share a machine at the clinic desk.
    expect(inactivityTimeoutFor("admin")).toBeLessThan(inactivityTimeoutFor("patient"));
  });

  it("treats any unknown or missing role as a patient", () => {
    // Failing towards the *shorter* admin window would log patients out early;
    // this must default to the ordinary case.
    expect(inactivityTimeoutFor(undefined)).toBe(INACTIVITY_TIMEOUT_MS.patient);
    expect(inactivityTimeoutFor("")).toBe(INACTIVITY_TIMEOUT_MS.patient);
    expect(inactivityTimeoutFor("nurse")).toBe(INACTIVITY_TIMEOUT_MS.patient);
  });

  it("maps the admin role exactly", () => {
    expect(inactivityTimeoutFor("admin")).toBe(INACTIVITY_TIMEOUT_MS.admin);
  });
});

describe("policy invariants", () => {
  it("warns before the cutoff, so the modal is reachable", () => {
    // This is the actual bug: a warning lead longer than the timeout, or a
    // second timer firing sooner, makes the warning impossible to ever see.
    for (const timeout of Object.values(INACTIVITY_TIMEOUT_MS)) {
      expect(INACTIVITY_WARNING_LEAD_MS).toBeLessThan(timeout);
    }
  });

  it("leaves a usable amount of time to read a page", () => {
    for (const timeout of Object.values(INACTIVITY_TIMEOUT_MS)) {
      expect(timeout).toBeGreaterThanOrEqual(5 * 60 * 1000);
    }
  });

  it("refreshes the server timestamp far less often than the timeout", () => {
    // The old code refreshed every 5 seconds of mouse movement, firing a
    // session write and a throttled DB read continuously while anyone used
    // the site.
    for (const timeout of Object.values(INACTIVITY_TIMEOUT_MS)) {
      expect(ACTIVITY_REFRESH_INTERVAL_MS).toBeLessThan(timeout);
    }
    expect(ACTIVITY_REFRESH_INTERVAL_MS).toBeGreaterThanOrEqual(60 * 1000);
  });
});
