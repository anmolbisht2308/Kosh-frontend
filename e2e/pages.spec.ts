import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { statePath } from "./env";

/** Every screen on desktop and phone: renders, clean console and network, no sideways scroll, no serious a11y issues. */

function watch(page: Page) {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(`page error: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (/React DevTools|\[HMR\]|\[Fast Refresh\]|favicon|net::ERR_ABORTED/.test(t)) return;
    problems.push(`console: ${t.slice(0, 300)}`);
  });
  page.on("response", (r) => {
    if (r.url().includes("/api/") && r.status() >= 500) problems.push(`API ${r.status()}: ${r.url()}`);
  });
  return problems;
}

async function check(page: Page, path: string, ready?: RegExp) {
  const problems = watch(page);
  const res = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(res?.status(), `${path} status`).toBeLessThan(400);
  await page.waitForLoadState("networkidle").catch(() => {});
  await expect(page.locator("main").first()).toBeVisible();
  if (ready) await expect(page.getByText(ready).first()).toBeVisible();
  await page.waitForTimeout(700); // entrance animations

  const overflow = await page.evaluate(() => {
    const w = document.documentElement.clientWidth;
    const wide = [...document.querySelectorAll<HTMLElement>("body *")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        if (!r.width || r.right <= w + 1) return false;
        for (let p = el.parentElement; p; p = p.parentElement) if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(p).overflowX)) return false;
        return true;
      })
      .slice(0, 3)
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`);
    return { scroll: document.documentElement.scrollWidth - w, wide };
  });
  expect(overflow.scroll, `${path} scrolls sideways: ${overflow.wide.join(" | ")}`).toBeLessThanOrEqual(1);

  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  const serious = axe.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => `${n.target.join(" ")} ${n.any[0]?.message?.slice(0, 90) ?? ""}`).join(" | ")}`);
  expect(serious, `${path} accessibility`).toEqual([]);
  expect(problems, `${path} errors`).toEqual([]);
}

test.describe("public", () => {
  test("landing", ({ page }) => check(page, "/", /One honest view/));
  test("sign up", ({ page }) => check(page, "/signup", /Create your free account/));
  test("log in", ({ page }) => check(page, "/login", /Welcome back/));
  test("recover", ({ page }) => check(page, "/recover", /Forgot your password/));
  test("404", async ({ page }) => {
    const res = await page.goto("/nope-nope");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Nothing here" })).toBeVisible();
  });
});

test.describe("signed in with the sample portfolio", () => {
  test.use({ storageState: statePath("demo") });
  test("portfolio", ({ page }) => check(page, "/app", /Where your money is/));
  test("upload", ({ page }) => check(page, "/app/upload", /Upload your CAS/));
  test("settings", ({ page }) => check(page, "/app/settings", /Account & privacy/));
});

test.describe("signed in, nothing uploaded yet", () => {
  test.use({ storageState: statePath("empty") });
  test("empty portfolio", ({ page }) => check(page, "/app", /Let's see everything you own/));
});

test("app pages send logged-out visitors to log in", async ({ page }) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login$/);
});
