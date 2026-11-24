import fs from "node:fs";
import path from "node:path";
import { API, AUTH_DIR, WEB, apiCall, signup } from "./env";

/** Two saved logins: one with the sample portfolio, one brand-new and empty. Also warms the price cache. */
export default async function globalSetup() {
  const health = await fetch(`${API}/health`).then((r) => r.json()).catch(() => null);
  if (!health?.db) throw new Error(`Kosh API not reachable at ${API}. Start Mongo and the API first.`);
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  for (const role of ["demo", "empty"] as const) {
    const u = await signup();
    if (role === "demo") {
      await apiCall("/api/demo", { method: "POST", token: u.token });
      await apiCall("/api/portfolio", { token: u.token }); // fetches AMFI/NSE once so tests don't wait on it
    }
    fs.writeFileSync(path.join(AUTH_DIR, `${role}.token`), JSON.stringify(u.token));
    fs.writeFileSync(path.join(AUTH_DIR, `${role}.json`), JSON.stringify({ cookies: [], origins: [{ origin: WEB, localStorage: [{ name: "kosh.token", value: u.token }] }] }));
  }
}
