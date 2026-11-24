"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, type Portfolio, type Statement } from "@/lib/api";
import { dateIN, inr, inrShort, pct, signedInr, tone } from "@/lib/format";
import { useAuth } from "../Auth";
import { toast } from "../ui/Toast";
import { Allocation } from "./Allocation";
import { Holdings } from "./Holdings";
import { Insights } from "./Insights";

type Full = Extract<Portfolio, { empty: false }>;

function Empty({ onDemo }: { onDemo: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <section className="card rise mx-auto max-w-2xl p-6 text-center sm:p-10">
      <p className="text-5xl" aria-hidden>
        📄
      </p>
      <h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">Let&apos;s see everything you own</h1>
      <p className="mx-auto mt-3 max-w-md text-ink/70">Upload your CAS: a free statement every investor in India can get. It lists all your mutual funds, and your stocks too if you have a demat account.</p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/app/upload" className="btn-primary">
          Add my statement
        </Link>
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onDemo();
            } finally {
              setBusy(false);
            }
          }}
          className="btn-ghost"
        >
          {busy ? "Loading sample…" : "Try a sample portfolio"}
        </button>
      </div>
      <p className="mt-6 text-xs text-ink/60">Your PDF is read in memory and thrown away. Only the holdings are kept, and you can delete them any time.</p>
    </section>
  );
}

const BROKERS: [RegExp, string][] = [
  [/^RAISE SECURITIES/i, "Dhan"],
  [/^GROWW/i, "Groww"],
  [/^INDSTOCKS/i, "INDstocks"],
  [/^ZERODHA/i, "Zerodha"],
  [/^PAYTM MONEY/i, "Paytm Money"],
  [/^(RKSV|UPSTOX)/i, "Upstox"],
  [/^ANGEL ONE/i, "Angel One"],
  [/^KOTAK SECURITIES/i, "Kotak Securities"],
  [/^ICICI SECURITIES/i, "ICICI Direct"],
  [/^HDFC SECURITIES/i, "HDFC Securities"],
];
const KIND: Record<string, string> = { cdsl: "CDSL demat", nsdl: "NSDL demat", folios: "", nps: "" };

function accountName(a: NonNullable<Statement["accounts"]>[number]): [string, string] {
  if (a.kind === "folios") return ["Mutual fund folios", "CAMS / KFintech"];
  if (a.kind === "nps") return ["NPS", ""];
  const tail = a.label.match(/••\d+$/)?.[0] ?? "";
  const broker = a.label.replace(/\s*••\d+$/, "");
  const friendly = BROKERS.find(([re]) => re.test(broker))?.[1] ?? broker.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  return [friendly, `${KIND[a.kind]} ${tail}`.trim()];
}

/** The statement's own per-account totals, so people can tick them off against the PDF. */
function StatementCheck({ s }: { s: Statement }) {
  const rows = (s.accounts ?? []).filter((a) => (a.statement ?? 0) > 0 || a.read > 0);
  if (!rows.length) return null;
  return (
    <div className="mt-3 border-t border-line pt-3">
      <ul className="space-y-1.5">
        {rows.map((a) => {
          const ok = a.statement == null || Math.abs(a.statement - a.read) <= Math.max(100, 0.005 * a.statement);
          const [name, kind] = accountName(a);
          return (
            <li key={a.label} className="flex items-start justify-between gap-3">
              <span className="min-w-0" title={a.label}>
                <span className="block truncate text-ink/85">{name}</span>
                {kind && <span className="block truncate text-xs text-ink/55">{kind}</span>}
              </span>
              <span className="num shrink-0">
                {inr(a.statement ?? a.read, { paise: true })}{" "}
                <span className={ok ? "text-gain" : "text-gold-deep"} aria-hidden>
                  {ok ? "✓" : "⚠"}
                </span>
                <span className="sr-only">{ok ? "fully read" : `only ${inr(a.read, { paise: true })} read`}</span>
              </span>
            </li>
          );
        })}
      </ul>
      {s.statement_total != null && (
        <p className="mt-2 flex items-baseline justify-between gap-3 border-t border-line pt-2 font-semibold">
          <span>Statement total</span>
          <span className="num">{inr(s.statement_total, { paise: true })}</span>
        </p>
      )}
      <p className="mt-2 text-xs text-ink/60">These are your statement&apos;s own figures for {dateIN(s.period_to)}. ✓ means Kosh read every holding in that account. The totals at the top use today&apos;s prices and group by funds and stocks, so they differ.</p>
    </div>
  );
}

function Stat({ label, value, sub, subTone }: { label: string; value: string; sub?: string; subTone?: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-ink/60">{label}</p>
      <p className="num mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      {sub && <p className={`num mt-1 text-sm font-medium ${subTone ?? "text-ink/60"}`}>{sub}</p>}
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const [p, setP] = useState<Portfolio | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [tick, setTick] = useState(0);
  const load = useCallback(() => {
    setErr(null);
    setTick((t) => t + 1);
  }, []);
  useEffect(() => {
    let alive = true;
    api<Portfolio>("/api/portfolio")
      .then((r) => alive && setP(r))
      .catch((e) => alive && setErr(e.message));
    return () => {
      alive = false;
    };
  }, [tick]);

  const loadDemo = async () => {
    try {
      await api("/api/demo", { method: "POST" });
      toast.success("Sample portfolio loaded");
      load();
    } catch (e) {
      toast.error(e);
    }
  };

  if (err)
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="font-semibold">Couldn&apos;t load your portfolio</p>
        <p className="mt-1 text-sm text-ink/70">{err}</p>
        <button onClick={load} className="btn-ghost mt-5">
          Try again
        </button>
      </main>
    );

  if (!p)
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6" aria-busy="true" aria-label="Loading your portfolio">
        <div className="h-44 animate-pulse rounded-3xl bg-white/70" />
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-3xl bg-white/70" />
          ))}
        </div>
      </main>
    );

  if (p.empty)
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <Empty onDemo={loadDemo} />
      </main>
    );

  const d = p as Full;
  const first = (user?.name || d.investor || "").split(" ")[0];
  const mfGainPct = d.mf.invested ? d.mf.gain / d.mf.invested : null;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      {d.is_demo && (
        <div className="flex flex-col gap-3 rounded-2xl bg-gold-soft px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            <b>This is a sample portfolio.</b> Real funds and stocks with live prices, made-up investor.
          </p>
          <Link href="/app/upload" className="btn-primary min-h-10 shrink-0 px-4 py-2 text-sm">
            Use my own statement
          </Link>
        </div>
      )}

      <section className="rise overflow-hidden rounded-[2rem] bg-ink p-6 text-white sm:p-8">
        <p className="text-sm text-white/70">{first ? `${first}'s portfolio` : "Your portfolio"}</p>
        <p className="num mt-2 font-display text-5xl font-semibold tracking-tight sm:text-6xl">{inr(d.total)}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {d.day_change !== 0 && (
            <span className={`num rounded-full px-3 py-1 font-semibold ${d.day_change > 0 ? "bg-white/10 text-[#7be0b3]" : "bg-white/10 text-[#ff9da3]"}`}>
              {d.day_change > 0 ? "▲" : "▼"} {signedInr(d.day_change)} today
            </span>
          )}
          {d.xirr != null && (
            <span className="text-white/80">
              Funds growing at <b className="num text-white">{pct(d.xirr)}</b> a year
            </span>
          )}
        </div>
        {d.statement_value != null && d.statement_date && !d.is_demo && (
          <p className="mt-4 text-sm text-white/80">
            On your statement ({dateIN(d.statement_date)}): <b className="num text-white">{inr(d.statement_value)}</b>
            {Math.abs(d.total - d.statement_value) >= 1 && (
              <>
                {" · "}
                <span className={`num font-semibold ${d.total >= d.statement_value ? "text-[#7be0b3]" : "text-[#ff9da3]"}`}>{signedInr(d.total - d.statement_value)}</span> since then from price changes
              </>
            )}
          </p>
        )}
        <p className="mt-2 text-xs text-white/60">
          Prices: funds {dateIN(d.holdings.mf.find((m) => m.price_date)?.price_date)} (AMFI) · stocks {dateIN(d.holdings.stocks.find((s) => s.price_date)?.price_date)} (NSE close)
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Mutual funds" value={inrShort(d.mf.value)} sub={`${d.mf.count} fund${d.mf.count === 1 ? "" : "s"}`} />
        <Stat
          label="Gain on funds"
          value={d.mf.invested ? signedInr(d.mf.gain) : "—"}
          sub={d.mf.invested ? `${pct(mfGainPct)} on ${inrShort(d.mf.invested)} invested` : "Cost not in your statement"}
          subTone={d.mf.invested ? tone(d.mf.gain) : undefined}
        />
        <Stat label="Stocks" value={d.stocks.count ? inrShort(d.stocks.value) : "—"} sub={d.stocks.count ? `${d.stocks.count} stock${d.stocks.count === 1 ? "" : "s"} in demat` : "Upload an NSDL/CDSL eCAS to add them"} />
      </div>

      <Insights items={d.insights} />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Holdings {...d.holdings} />
        <div className="space-y-6">
          <Allocation allocation={d.allocation} />
          <section className="card p-5 sm:p-6" aria-labelledby="st-h">
            <h2 id="st-h" className="font-display text-xl font-semibold">
              Statements
            </h2>
            <ul className="mt-3 space-y-3">
              {d.statements.map((s) => (
                <li key={s.family} className="rounded-2xl bg-paper p-3 text-sm">
                  <p className="font-semibold">
                    {s.source_label} {s.family === "rta" ? "CAS" : "eCAS"} {s.detailed ? "· detailed" : ""}
                  </p>
                  <p className="text-ink/60">As of {dateIN(s.period_to)}</p>
                  <StatementCheck s={s} />
                </li>
              ))}
            </ul>
            <Link href="/app/upload" className="btn-ghost mt-4 w-full">
              Add or update a statement
            </Link>
          </section>
        </div>
      </div>

      <p className="pb-8 text-center text-xs text-ink/60">Kosh shows facts about your own investments. It is not investment advice. Prices are end-of-day from AMFI and NSE.</p>
    </main>
  );
}
