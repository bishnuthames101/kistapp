import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end smoke tests.
 *
 * Unlike the Vitest suite these need a database and a running server, so CI
 * only runs them when DATABASE_URL is configured. Locally:
 *
 *   npx playwright install --with-deps chromium
 *   npm run test:e2e
 */
const PORT = process.env.PORT ?? "3000";
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Booking the same slot twice is a conflict by design, so these must not
  // race each other.
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  // Reuse an already-running dev server locally; start one in CI.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run start",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
