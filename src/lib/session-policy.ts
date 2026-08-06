/**
 * One definition of how long a session may sit idle.
 *
 * This used to be specified in three places that disagreed: a silent 90s timer
 * in AuthContext, a 90s/120s timer with a warning modal in InactivityMonitor,
 * and a 90s/120s check in the NextAuth jwt callback. The silent one always
 * fired first, so the warning modal was unreachable and patients were logged
 * out mid-booking with no explanation.
 *
 * Staff sit on a shared machine at the clinic desk, so their window is
 * shorter than a patient's. Both are long enough to read a page.
 */

export const INACTIVITY_TIMEOUT_MS = {
  admin: 15 * 60 * 1000,
  patient: 20 * 60 * 1000,
} as const;

/** How long before the cutoff the "still there?" prompt appears. */
export const INACTIVITY_WARNING_LEAD_MS = 60 * 1000;

/**
 * Activity refreshes the server-side timestamp at most this often. The old
 * code refreshed every 5 seconds of mouse movement, which meant a session
 * write and a throttled database read continuously while anyone used the site.
 */
export const ACTIVITY_REFRESH_INTERVAL_MS = 2 * 60 * 1000;

export function inactivityTimeoutFor(role: string | undefined): number {
  return role === "admin"
    ? INACTIVITY_TIMEOUT_MS.admin
    : INACTIVITY_TIMEOUT_MS.patient;
}
