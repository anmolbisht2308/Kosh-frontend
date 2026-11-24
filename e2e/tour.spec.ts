import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { FIX, PASSWORD, asNewUser, freshEmail } from "./env";

/**
 * Visual tour: screenshots of every screen, popup and menu on phone and desktop for a person to review.
 *   TOUR=1 npx playwright test e2e/tour.spec.ts     → e2e/.results/tour/
 */
test.skip(!process.env.TOUR, "set TOUR=1 to take the tour");

const snap = async (page: Page, info: TestInfo, name: string, fullPage = false) => {
  await page.waitForTimeout(800);
  await page.screenshot({ path: `e2e/.results/tour/${info.project.name}-${name}.png`, fullPage });
};

test("public", async ({ page }, info) => {
  await page.goto("/");
  await snap(page, info, "01-landing", true);
  await page.goto("/signup");
  await page.getByLabel("Email").fill(freshEmail("tour"));
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await snap(page, info, "02-signup");
  await page.getByRole("checkbox", { name: /not investment advice/ }).check();
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Save your recovery code" })).toBeVisible();
  await snap(page, info, "03-recovery-code");
  await page.goto("/nope");
  await snap(page, info, "04-404");
});

test("login error", async ({ page }, info) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("nobody@example.com");
  await page.getByLabel("Password", { exact: true }).fill("wrong password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.locator("p[role=alert]")).toBeVisible();
  await snap(page, info, "05-login-error");
});

test("app", async ({ page }, info) => {
  await asNewUser(page);
  await page.goto("/app");
  await expect(page.getByRole("heading", { name: /Let's see everything/ })).toBeVisible();
  await snap(page, info, "10-empty");
  await page.getByRole("button", { name: "Try a sample portfolio" }).click();
  await expect(page.getByRole("heading", { name: "Where your money is" })).toBeVisible();
  await snap(page, info, "11-dashboard", true);
  await page.getByRole("button", { name: "Account" }).click();
  await snap(page, info, "12-account-menu");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /HDFC Mid Cap/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await snap(page, info, "13-fund-sheet");
  await page.keyboard.press("Escape");
  await page.getByRole("tab", { name: /Stocks/ }).click();
  await page.getByRole("tab", { name: /Stocks/ }).scrollIntoViewIfNeeded();
  await snap(page, info, "14-stocks-tab");
  await page.goto("/app/upload");
  await snap(page, info, "15-upload", true);
  await page.locator("#cas-file").setInputFiles(FIX("locked.pdf"));
  await page.getByLabel("PDF password").fill("WRONG");
  await page.getByRole("button", { name: "Add to my portfolio" }).click();
  await expect(page.locator("p[role=alert]")).toBeVisible();
  await snap(page, info, "16-upload-error");
  await page.goto("/app/settings");
  await expect(page.getByRole("heading", { name: "Account & privacy" })).toBeVisible();
  await snap(page, info, "17-settings", true);
  await page.getByRole("button", { name: "Delete my account" }).click();
  await snap(page, info, "18-delete-dialog");
});
