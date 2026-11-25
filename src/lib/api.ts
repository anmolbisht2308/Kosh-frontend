export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const TOKEN_KEY = "kosh.token";
export const getToken = () => {
  try {
    return typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const setToken = (t: string | null) => {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("kosh.user");
    }
  } catch {}
};

const USER_KEY = "kosh.user";
/** The last signed-in user, so a flaky network on page load doesn't look like being logged out. */
export const cachedUser = (): User | null => {
  try {
    const raw = typeof window === "undefined" ? null : localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};
export const cacheUser = (u: User | null) => {
  try {
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  } catch {}
};

/** Fired when the API says the session is no longer valid (logged out elsewhere, password changed). */
export const SESSION_ENDED = "kosh:session-ended";

type Opts = { method?: string; body?: unknown; form?: FormData; auth?: boolean };

export async function api<T>(path: string, opts: Opts = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (!opts.form) headers["content-type"] = "application/json";
  const token = opts.auth === false ? null : getToken();
  if (token) headers.authorization = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: opts.method ?? (opts.body || opts.form ? "POST" : "GET"),
      headers,
      body: opts.form ?? (opts.body ? JSON.stringify(opts.body) : undefined),
    });
  } catch {
    throw new ApiError(0, "Can't reach Kosh right now. Check your internet and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token && typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_ENDED));
    throw new ApiError(res.status, data.error ?? "Something went wrong. Please try again.");
  }
  return data as T;
}

/* ---------- types mirrored from the API ---------- */
export type User = { id: string; email: string; name?: string | null };

export type Fund = {
  id: string;
  name: string;
  isin?: string;
  amc?: string | null;
  folio?: string | null;
  held_in: "folio" | "demat";
  units: number;
  price?: number;
  price_date?: string;
  value: number;
  cost?: number | null;
  gain?: number;
  xirr?: number | null;
  day_change?: number;
  plan: "direct" | "regular";
  asset: string;
  category?: string | null;
  has_transactions: boolean;
};

export type Stock = {
  id: string;
  name: string;
  isin: string;
  symbol?: string | null;
  qty: number;
  price?: number;
  price_date?: string;
  value: number;
  day_change?: number;
  account: string;
};

export type Bond = { id: string; name: string; isin: string; qty: number; value: number; coupon?: number | null; maturity?: string | null; account: string };
export type Nps = { value: number; schemes: { scheme: string; tier?: string; units?: number; nav?: number; value: number }[] } | null;

export type Insight = {
  id: string;
  tone: "warn" | "info";
  title: string;
  body: string;
  rows: { name: string; value?: number; yearly?: number; gap?: number; direct_name?: string }[];
};

export type Statement = {
  family: "rta" | "demat";
  source: string;
  source_label: string;
  detailed: boolean;
  period_from?: string;
  period_to?: string;
  filename: string;
  uploaded_at?: string;
  counts?: Record<string, number>;
  /** Each account's total as printed on the statement, next to what Kosh itemised (eCAS only). */
  accounts?: { label: string; kind: "cdsl" | "nsdl" | "folios" | "nps"; statement: number | null; read: number }[];
  statement_total?: number;
};

export type Portfolio =
  | { empty: true }
  | {
      empty: false;
      is_demo: boolean;
      investor?: string | null;
      statements: Statement[];
      prices_updated: { funds?: string; stocks?: string };
      total: number;
      /** The same holdings at the statement's own prices, and the statement date. */
      statement_value?: number;
      statement_date?: string | null;
      day_change: number;
      xirr: number | null;
      mf: { value: number; invested: number; gain: number; cost_known_for: number; count: number };
      stocks: { value: number; count: number };
      allocation: { key: string; label: string; value: number; share: number }[];
      holdings: { mf: Fund[]; stocks: Stock[]; bonds: Bond[]; nps: Nps };
      insights: Insight[];
    };

export type Txn = { date: string; type: string; amount?: number | null; units?: number | null; nav?: number | null };
