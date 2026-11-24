import { expect, test } from "@playwright/test";
import { asNewUser, statePath } from "./env";

/** How the UI behaves while you use it. */

test("focused text fields show one green border, no extra ring", async ({ page }) => {
  await page.goto("/login");
  const email = page.getByLabel("Email");
  await email.focus();
  const s = await email.evaluate((el) => {
    const c = getComputedStyle(el);
    return { outline: c.outlineStyle, border: c.borderTopColor };
  });
  expect(s.outline).toBe("none");
  expect(s.border).toBe("rgb(11, 107, 79)");
});

test("keyboard focus on links and buttons shows a ring", async ({ page }, info) => {
  test.skip(info.project.name === "phone", "keyboard check on desktop");
  await page.goto("/");
  await page.keyboard.press("Tab");
  const ring = await page.evaluate(() => getComputedStyle(document.activeElement as Element).outlineStyle);
  expect(ring).not.toBe("none");
});

test.describe("signed in", () => {
  test.use({ storageState: statePath("demo") });

  test("account menu closes on outside tap, on Esc, and when a popup opens", async ({ page }) => {
    await page.goto("/app");
    const menu = page.getByRole("menu");
    await page.getByRole("button", { name: "Account" }).click();
    await expect(menu).toBeVisible();
    await page.mouse.click(5, 500);
    await expect(menu).toBeHidden();
    await page.getByRole("button", { name: "Account" }).click();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    // open the menu, then open a fund with the keyboard: the menu must not stay behind the popup
    await page.getByRole("button", { name: "Account" }).click();
    await page.getByRole("button", { name: /Parag Parikh Flexi Cap/ }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(menu).toBeHidden();
  });

  test("a popup locks page scroll, takes focus, and gives it back when closed", async ({ page }) => {
    await page.goto("/app");
    const fund = page.getByRole("button", { name: /Parag Parikh Flexi Cap/ });
    await fund.click();
    await expect(page.getByRole("dialog")).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
    await expect(fund).toBeFocused();
  });
});

test("phone: the dashboard header nav and tabs fit without sideways scrolling", async ({ page }, info) => {
  test.skip(info.project.name !== "phone", "phone only");
  await asNewUser(page, { demo: true });
  await page.goto("/app");
  await expect(page.getByRole("tab", { name: /Mutual funds/ })).toBeVisible();
  const tabs = await page.getByRole("tablist").boundingBox();
  expect(tabs!.x + tabs!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
});
