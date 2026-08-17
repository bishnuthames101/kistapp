import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

/**
 * ESLint 9 flat config.
 *
 * This replaces `.eslintrc.json` + `next lint`. `next lint` was removed in
 * Next 16, so `npm run lint` errored out ("Invalid project directory ... /lint")
 * and nobody had been linting this project for a while. The script now calls
 * `eslint .` directly.
 *
 * eslint-config-next 16 ships flat-config arrays, so no `FlatCompat` shim.
 */
export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "src/generated/**",
      "next-env.d.ts",
      "*.tsbuildinfo",
      "prisma/migrations/**",
    ],
  },

  ...nextCoreWebVitals,
  ...nextTypeScript,

  {
    rules: {
      // `catch (error: any)` then `error.response?.data` is how the old axios
      // client leaked through the codebase. Warn rather than error so this
      // lands without a big-bang refactor, but make it visible.
      "@typescript-eslint/no-explicit-any": "warn",

      // Unused vars are a warning, but allow the `_`-prefix escape hatch for
      // deliberately-ignored destructured fields and catch bindings.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  {
    // Seed and config scripts run in Node, not the browser, and legitimately
    // log to the console.
    files: ["prisma/**/*.ts", "*.config.{ts,mts,mjs}", "scripts/**/*.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
