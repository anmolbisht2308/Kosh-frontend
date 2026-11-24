/** ₹12,34,567 — Indian grouping, no paise for big numbers. */
export const inr = (n: number | null | undefined, opts: { paise?: boolean } = {}) =>
  n == null || Number.isNaN(n)
    ? "—"
    : `${n < 0 ? "−" : ""}₹${Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: opts.paise ? 2 : 0, minimumFractionDigits: opts.paise ? 2 : 0 })}`;

/** ₹12.3 L / ₹1.24 Cr — for headlines and tight spaces. */
export const inrShort = (n: number | null | undefined) => {
  if (n == null) return "—";
  const a = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (a >= 1e7) return `${sign}₹${(a / 1e7).toFixed(a >= 1e9 ? 0 : 2)} Cr`;
  if (a >= 1e5) return `${sign}₹${(a / 1e5).toFixed(a >= 1e7 ? 0 : 2)} L`;
  return inr(n);
};

/** +₹1,240 / −₹300 */
export const signedInr = (n: number | null | undefined) => (n == null ? "—" : `${n > 0 ? "+" : ""}${inr(n)}`);

export const pct = (x: number | null | undefined, digits = 1) =>
  x == null || Number.isNaN(x) ? "—" : `${x > 0 ? "+" : x < 0 ? "−" : ""}${Math.abs(x * 100).toFixed(digits)}%`;

export const share = (x: number) => `${(x * 100).toFixed(x < 0.1 ? 1 : 0)}%`;

export const units = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 3 });

export const dateIN = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00+05:30` : iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
};

export const tone = (n: number | null | undefined) => (n == null || n === 0 ? "text-ink/70" : n > 0 ? "text-gain" : "text-loss");

/** Fund names from statements are long and shouty; keep them readable. */
export const tidyName = (s: string) =>
  s === s.toUpperCase() ? s.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase()).replace(/\b(Idcw|Elss|Etf|Psu|Hdfc|Sbi|Icici|Uti|Lic|Dsp|Pgim)\b/g, (m) => m.toUpperCase()) : s;

export const ASSET_COLOR: Record<string, string> = {
  equity: "var(--color-a-equity)",
  stocks: "var(--color-a-stocks)",
  debt: "var(--color-a-debt)",
  hybrid: "var(--color-a-hybrid)",
  other: "var(--color-a-other)",
};
/** Fixed order so each colour always sits next to the same neighbours (checked for colour-blind separation). */
export const ASSET_ORDER = ["equity", "stocks", "debt", "hybrid", "other"] as const;
export const ASSET_LABEL: Record<string, string> = { equity: "Equity funds", stocks: "Stocks", debt: "Debt funds", hybrid: "Hybrid funds", other: "Other" };
