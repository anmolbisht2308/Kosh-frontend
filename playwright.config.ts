import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests for Kosh. Needs Mongo, the API on :8000 and the web app on :3300.
 *   npx playwright test             # everything, desktop + phone
 *   TOUR=1 npx playwright test e2e/tour.spec.ts   # screenshots of every screen for a person to review
 */
export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/.results",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { outputFolder: "e2e/.report", open: "never" }]],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: process.env.E2E_WEB_URL ?? "http://localhost:3300",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 900 } } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
});
