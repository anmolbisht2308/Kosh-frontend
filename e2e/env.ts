import fs from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";

export const WEB = process.env.E2E_WEB_URL ?? "http://localhost:3300";
export const API = process.env.E2E_API_URL ?? "http://localhost:8000";
export const AUTH_DIR = path.join(__dirname, ".auth");
export const FIX = (f: string) => path.join(__dirname, "fixtures", f);
export const PASSWORD = "correct horse battery";

export type Role = "demo" | "empty";
export const statePath = (r: Role) => path.join(AUTH_DIR, `${r}.json`);
export const tokenOf = (r: Role): string => JSON.parse(fs.readFileSync(path.join(AUTH_DIR, `${r}.token`), "utf8"));

let n = 0;
export const freshEmail = (tag = "t") => `${tag}.${Date.now().toString(36)}${(n++).toString(36)}${Math.random().toString(36).slice(2, 6)}@example.com`;

export async function apiCall<T = Record<string, unknown>>(p: string, opts: { method?: string; body?: unknown; token?: string } = {}) {
  const res = await fetch(`${API}${p}`, {
    method: opts.method ?? (opts.body ? "POST" : "GET"),
    headers: { "content-type": "application/json", ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  return { status: res.status, data: (await res.json().catch(() => ({}))) as T };
}

export async function signup(email = freshEmail(), name = "Test Investor") {
  const r = await apiCall<{ token: string; recovery_code: string }>("/api/auth/signup", { body: { email, password: PASSWORD, name } });
  if (r.status !== 201) throw new Error(`signup failed ${r.status} ${JSON.stringify(r.data)}`);
  return { email, token: r.data.token, recovery: r.data.recovery_code };
}

/** Signs a page in as a brand-new user (optionally with the sample portfolio loaded). */
export async function asNewUser(page: Page, opts: { demo?: boolean } = {}) {
  const u = await signup();
  if (opts.demo) await apiCall("/api/demo", { method: "POST", token: u.token });
  // set once (not on every load), so a token the app later replaces isn't put back
  await page.goto("/404-warmup");
  await page.evaluate((t) => localStorage.setItem("kosh.token", t), u.token);
  return u;
}
