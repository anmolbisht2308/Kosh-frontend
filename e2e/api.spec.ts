import fs from "node:fs";
import { expect, test } from "@playwright/test";
import { API, FIX, PASSWORD, apiCall, freshEmail, signup, tokenOf } from "./env";

/** Server rules. API-only, so they run once. */
test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "API checks run once"));

test("everything private needs a valid login", async () => {
  for (const p of ["/api/portfolio", "/api/auth/me", "/api/portfolio/export.csv"]) expect((await apiCall(p)).status).toBe(401);
  expect((await apiCall("/api/portfolio", { token: "garbage" })).status).toBe(401);
});

test("emails are case-insensitive and validated", async () => {
  const email = freshEmail("Case");
  await signup(email);
  expect((await apiCall("/api/auth/login", { body: { email: email.toUpperCase(), password: PASSWORD } })).status).toBe(200);
  expect((await apiCall("/api/auth/signup", { body: { email: "not-an-email", password: PASSWORD } })).status).toBe(400);
});

test("login is rate limited after repeated wrong passwords", async () => {
  const { email } = await signup();
  const codes = [];
  for (let i = 0; i < 12; i++) codes.push((await apiCall("/api/auth/login", { body: { email, password: "wrong wrong" } })).status);
  expect(codes.slice(0, 10).every((c) => c === 401)).toBe(true);
  expect(codes.at(-1)).toBe(429);
});

test("users only ever see their own portfolio", async () => {
  const a = await signup();
  const b = await signup();
  await apiCall("/api/demo", { method: "POST", token: a.token });
  const pb = await apiCall<{ empty: boolean }>("/api/portfolio", { token: b.token });
  expect(pb.data.empty).toBe(true);
  const fund = await apiCall("/api/portfolio/funds/mf:INF879O01027:DEMO1", { token: b.token });
  expect(fund.status).toBe(404);
});

test("uploads: size, type and password errors are friendly, and the PDF is never echoed back", async () => {
  const { token } = await signup();
  const send = async (file: string, password: string) => {
    const form = new FormData();
    form.append("file", new Blob([fs.readFileSync(FIX(file))], { type: "application/pdf" }), file);
    form.append("password", password);
    const res = await fetch(`${API}/api/statements`, { method: "POST", body: form, headers: { authorization: `Bearer ${token}` } });
    return { status: res.status, body: await res.json() };
  };
  expect((await send("not-a-pdf.pdf", "")).status).toBe(400);
  const wrong = await send("locked.pdf", "nope");
  expect(wrong.status).toBe(400);
  expect(wrong.body.error).toContain("Wrong PDF password");
  const notCas = await send("plain.pdf", "");
  expect(notCas.status).toBe(422);
  expect(JSON.stringify(notCas.body)).not.toContain("Just a test PDF");
});

test("portfolio maths: values add up and allocation shares sum to 100%", async () => {
  const p = await apiCall<{ total: number; mf: { value: number }; stocks: { value: number }; allocation: { share: number; value: number }[]; xirr: number }>("/api/portfolio", { token: tokenOf("demo") });
  const d = p.data;
  expect(Math.abs(d.mf.value + d.stocks.value - d.total)).toBeLessThan(1);
  expect(Math.abs(d.allocation.reduce((s, a) => s + a.share, 0) - 1)).toBeLessThan(0.001);
  expect(d.xirr).toBeGreaterThan(-0.5);
  expect(d.xirr).toBeLessThan(1);
});

test("price refresh endpoint is locked without the scheduler secret", async () => {
  const r = await fetch(`${API}/internal/refresh-prices`, { method: "POST" });
  expect(r.status).toBe(403);
});
