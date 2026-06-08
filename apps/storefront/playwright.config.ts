import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for @nextshop/storefront E2E smoke tests.
 * The webServer starts the production build on port 3100 so tests hit real
 * Next.js output (same as CI). In local dev, the server is reused if it's
 * already running.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    // Build then serve; in CI STORE_CLIENT is set by the workflow env.
    command: "pnpm build && pnpm start -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      STORE_CLIENT: process.env.STORE_CLIENT ?? "finnish-grocer",
    },
  },
});
