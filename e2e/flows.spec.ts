import { expect, test } from "@playwright/test";
import { FIX, PASSWORD, apiCall, asNewUser, freshEmail, signup, statePath } from "./env";

test.describe("accounts", () => {
  test("sign up shows a recovery code that must be saved before continuing", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel(/Your name/).fill("Meera");
    await page.getByLabel("Email").fill(freshEmail("ui"));
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("checkbox", { name: /not investment advice/ }).check();
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByRole("heading", { name: "Save your recovery code" })).toBeVisible();
    await expect(page.getByText(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/)).toBeVisible();
    const go = page.getByRole("button", { name: "Go to my portfolio" });
    await expect(go).toBeDisabled();
    await page.getByRole("checkbox", { name: /saved my recovery code/ }).check();
    await go.click();
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByRole("heading", { name: /Let's see everything you own/ })).toBeVisible();
  });

  test("short passwords and duplicate emails get clear messages", async ({ page }) => {
    const { email } = await signup();
    await page.goto("/signup");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("short");
    await page.getByRole("checkbox", { name: /not investment advice/ }).check();
    await page.getByRole("button", { name: "Create account" }).click();
    // the browser's own length check stops the form first
    expect(await page.getByLabel("Password", { exact: true }).evaluate((el: HTMLInputElement) => el.validity.tooShort)).toBe(true);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.locator("p[role=alert]")).toContainText("already exists");
  });

  test("log in, wrong password, log out", async ({ page }) => {
    const { email } = await signup();
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("not the password");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.locator("p[role=alert]")).toContainText("Email or password is wrong");
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/app$/);
    await page.getByRole("button", { name: "Account" }).click();
    await page.getByRole("menuitem", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto("/app");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("forgot password: the recovery code sets a new password and is replaced", async ({ page }) => {
    const { email, recovery } = await signup();
    await page.goto("/recover");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Recovery code").fill(recovery.toLowerCase().replace(/-/g, " "));
    await page.getByLabel("New password").fill("a brand new password");
    await page.getByRole("button", { name: "Set new password" }).click();
    await expect(page.getByText("Password changed")).toBeVisible();
    // the old code is now useless; the new password works
    const reuse = await apiCall("/api/auth/recover", { body: { email, recovery_code: recovery, new_password: "another one 123" } });
    expect(reuse.status).toBe(401);
    const ok = await apiCall("/api/auth/login", { body: { email, password: "a brand new password" } });
    expect(ok.status).toBe(200);
  });
});

test.describe("portfolio", () => {
  test.use({ storageState: statePath("demo") });

  test("sample portfolio shows totals, insights, allocation and holdings", async ({ page }) => {
    await page.goto("/app");
    await expect(page.getByText("This is a sample portfolio.")).toBeVisible();
    await expect(page.locator("section").first().getByText(/^₹[\d,]+$/).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Worth knowing" })).toBeVisible();
    await expect(page.getByText(/Regular plans? (cost|in)/).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Where your money is" })).toBeVisible();
    await expect(page.getByRole("img", { name: /Equity funds \d+%/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Mutual funds 6/ })).toBeVisible();
    await page.getByRole("tab", { name: /Stocks 7/ }).click();
    // a table on desktop, a list on phones; either way RELIANCE is visible
    await expect(page.getByRole("tabpanel", { name: "Stocks" }).getByText("RELIANCE", { exact: true }).filter({ visible: true })).toBeVisible();
  });

  test("opening a fund shows its details and every transaction; Esc closes it", async ({ page }) => {
    await page.goto("/app");
    await page.getByRole("button", { name: /Parag Parikh Flexi Cap/ }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("XIRR (yearly return)")).toBeVisible();
    await expect(dialog.getByRole("row")).toHaveCount(37); // header + 36 monthly SIPs
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});

test.describe("uploading statements", () => {
  test("a file that isn't a PDF is refused", async ({ page }) => {
    await asNewUser(page);
    await page.goto("/app/upload");
    await page.locator("#cas-file").setInputFiles(FIX("not-a-pdf.pdf"));
    await page.getByRole("button", { name: "Add to my portfolio" }).click();
    await expect(page.locator("p[role=alert]")).toContainText("as a PDF");
  });

  test("a locked PDF with the wrong password explains where the password comes from", async ({ page }) => {
    await asNewUser(page);
    await page.goto("/app/upload");
    await page.locator("#cas-file").setInputFiles(FIX("locked.pdf"));
    await page.getByLabel("PDF password").fill("WRONG1234X");
    await page.getByRole("button", { name: "Add to my portfolio" }).click();
    await expect(page.locator("p[role=alert]")).toContainText("Wrong PDF password");
    await expect(page.locator("p[role=alert]")).toContainText("PAN in capitals");
  });

  test("a PDF that isn't a CAS gets a helpful message", async ({ page }) => {
    await asNewUser(page);
    await page.goto("/app/upload");
    await page.locator("#cas-file").setInputFiles(FIX("locked.pdf"));
    await page.getByLabel("PDF password").fill("ABCDE1234F");
    await page.getByRole("button", { name: "Add to my portfolio" }).click();
    await expect(page.locator("p[role=alert]")).toContainText("couldn't read this statement");
  });

  test("new user can load the sample, then remove it from settings", async ({ page }) => {
    await asNewUser(page);
    await page.goto("/app");
    await page.getByRole("button", { name: "Try a sample portfolio" }).click();
    await expect(page.getByText("This is a sample portfolio.")).toBeVisible();
    await page.goto("/app/settings");
    page.on("dialog", (d) => d.accept());
    for (const label of ["CAMS CAS", "CDSL eCAS"]) {
      await page.getByRole("listitem").filter({ hasText: label }).getByRole("button", { name: "Remove" }).click();
      await expect(page.getByRole("listitem").filter({ hasText: label })).toHaveCount(0);
    }
    await page.goto("/app");
    await expect(page.getByRole("heading", { name: /Let's see everything you own/ })).toBeVisible();
  });
});

test.describe("settings", () => {
  test("download holdings as CSV", async ({ page }) => {
    await asNewUser(page, { demo: true });
    await page.goto("/app/settings");
    const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Download my holdings/ }).click()]);
    expect(dl.suggestedFilename()).toBe("kosh-portfolio.csv");
    const text = await (await dl.createReadStream()).toArray().then((c) => Buffer.concat(c).toString());
    expect(text).toContain("Parag Parikh");
    expect(text).toContain("RELIANCE");
  });

  test("change password logs out other sessions", async ({ page }) => {
    const u = await asNewUser(page);
    await page.goto("/app/settings");
    await page.getByRole("button", { name: "Change password" }).click();
    await page.getByLabel("Current password").fill(PASSWORD);
    await page.getByLabel("New password").fill("changed password 99");
    await page.getByRole("button", { name: "Change password" }).last().click();
    await expect(page.getByText(/Password changed/)).toBeVisible();
    expect((await apiCall("/api/auth/me", { token: u.token })).status).toBe(401); // old token dead
    await page.reload();
    await expect(page.getByRole("heading", { name: "Account & privacy" })).toBeVisible(); // this one still works
  });

  test("delete account removes everything", async ({ page }) => {
    const u = await asNewUser(page, { demo: true });
    await page.goto("/app/settings");
    await page.getByRole("button", { name: "Delete my account" }).click();
    await page.getByLabel("Your password").fill(PASSWORD);
    await page.getByRole("button", { name: "Delete everything" }).click();
    await expect(page).toHaveURL(/\/$/);
    expect((await apiCall("/api/auth/login", { body: { email: u.email, password: PASSWORD } })).status).toBe(401);
  });
});
