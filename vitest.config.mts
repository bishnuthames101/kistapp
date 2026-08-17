import { defineConfig } from "vitest/config";

/**
 * Unit / integration tests for the logic that has actually broken in this
 * project: response shapes, session policy, password-reset token lifecycle and
 * appointment slot arithmetic.
 *
 * End-to-end coverage lives in `e2e/` and runs under Playwright, which needs a
 * database and a running server; these tests need neither and run on every push.
 */
export default defineConfig({
  resolve: {
    // Honours the `@/*` paths from tsconfig.json.
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globals: false,
  },
});
