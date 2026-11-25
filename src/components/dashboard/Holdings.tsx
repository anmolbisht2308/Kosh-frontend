"use client";

import { useEffect, useState } from "react";
import {
  api,
  type Bond,
  type Fund,
  type Nps,
  type Stock,
  type Txn,
} from "@/lib/api";
import {
  dateIN,
  inr,
  pct,
  signedInr,
  tidyName,
  tone,
  units,
} from "@/lib/format";
import { Modal } from "../ui/overlay";

type Tab = "mf" | "stocks" | "other";

function PlanBadge({ plan }: { plan: Fund["plan"] }) {
  return plan === "direct" ? (
    <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-deep">
      Direct
    </span>
  ) : (
    <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-semibold text-gold-deep">
      Regular
    </span>
  );
}

const TXN_LABEL: Record<string, string> = {
  PURCHASE: "Bought",
  PURCHASE_SIP: "SIP",
  REDEMPTION: "Sold",
  SWITCH_IN: "Switched in",
  SWITCH_IN_MERGER: "Merger in",
  SWITCH_OUT: "Switched out",
  SWITCH_OUT_MERGER: "Merger out",
  DIVIDEND_PAYOUT: "Dividend paid",
  DIVIDEND_REINVEST: "Dividend reinvested",
  STAMP_DUTY_TAX: "Stamp duty",
  STT_TAX: "STT",
  TDS_TAX: "TDS",
};

function FundSheet({ fund, onClose }: { fund: Fund; onClose: () => void }) {
  const [txns, setTxns] = useState<Txn[] | null>(null);
  useEffect(() => {
    if (!fund.has_transactions) return;
    api<{ transactions: Txn[] }>(
      `/api/portfolio/funds/${encodeURIComponent(fund.id)}`,
    )
      .then((r) => setTxns(r.transactions))
      .catch(() => setTxns([]));
  }, [fund]);
  const stats: [string, string, string?][] = [
    ["Current value", inr(fund.value)],
    ["Invested", fund.cost ? inr(fund.cost) : "Not in statement"],
    ["Gain", fund.gain != null ? signedInr(fund.gain) : "—"],
    [
      "XIRR (yearly return)",
      fund.xirr != null ? pct(fund.xirr) : "Needs a detailed CAS",
    ],
    ["Units", units(fund.units)],
    [
      "NAV",
      fund.price ? inr(fund.price, { paise: true }) : "—",
      fund.price && fund.price_date ? `on ${dateIN(fund.price_date)}` : undefined,
    ],
  ];
  return (
    <Modal title={tidyName(fund.name)} onClose={onClose} wide>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-ink/70">
        <PlanBadge plan={fund.plan} />
        {[fund.category, fund.folio && `Folio ${fund.folio}`, fund.held_in === "demat" && "Held in demat"]
          .filter(Boolean)
          .map((t) => (
            <span key={String(t)} className="whitespace-nowrap">
              {t}
            </span>
          ))}
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map(([k, v, sub]) => (
          <div key={k} className="rounded-2xl bg-paper p-3">
            <dt className="text-xs text-ink/60">{k}</dt>
            <dd
              className={`num mt-0.5 font-semibold ${k === "Gain" ? tone(fund.gain) : ""}`}
            >
              {v}
              {sub && <span className="block text-xs font-normal text-ink/60">{sub}</span>}
            </dd>
          </div>
        ))}
      </dl>
      <h3 className="mt-6 font-semibold">Transactions</h3>
      {!fund.has_transactions ? (
        <p className="mt-2 text-sm text-ink/70">
          This statement only has a summary. Upload a detailed CAS from CAMS to
          see every SIP and redemption, and your true yearly return.
        </p>
      ) : txns === null ? (
        <div className="mt-3 h-24 animate-pulse rounded-2xl bg-paper" />
      ) : (
        <div className="mt-3 max-h-80 overflow-y-auto rounded-2xl ring-1 ring-line">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-paper text-left text-xs text-ink/60">
              <tr>
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 font-semibold">What</th>
                <th className="px-3 py-2 text-right font-semibold">Amount</th>
                <th className="hidden px-3 py-2 text-right font-semibold sm:table-cell">
                  Units
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {txns.map((t, i) => (
                <tr key={i}>
                  <td className="num whitespace-nowrap px-3 py-2">
                    {dateIN(t.date)}
                  </td>
                  <td className="px-3 py-2">
                    {TXN_LABEL[t.type] ??
                      t.type.toLowerCase().replace(/_/g, " ")}
                  </td>
                  <td className="num px-3 py-2 text-right">
                    {t.amount != null ? inr(Math.abs(t.amount)) : "—"}
                  </td>
                  <td className="num hidden px-3 py-2 text-right sm:table-cell">
                    {t.units != null ? units(t.units) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}

export function Holdings({
  mf,
  stocks,
  bonds,
  nps,
}: {
  mf: Fund[];
  stocks: Stock[];
  bonds: Bond[];
  nps: Nps;
}) {
  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "mf", label: "Mutual funds", count: mf.length },
    { id: "stocks", label: "Stocks", count: stocks.length },
    {
      id: "other",
      label: "Bonds & NPS",
      count: bonds.length + (nps?.schemes.length ?? 0),
    },
  ];
  const visible = tabs.filter((t) => t.count > 0);
  const [tab, setTab] = useState<Tab>(visible[0]?.id ?? "mf");
  const [open, setOpen] = useState<Fund | null>(null);
  const current = visible.some((t) => t.id === tab) ? tab : visible[0]?.id;

  return (
    <section className="card overflow-hidden" aria-labelledby="hold-h">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6">
        <h2 id="hold-h" className="font-display text-xl font-semibold">
          Your holdings
        </h2>
        <div
          role="tablist"
          aria-label="Holding type"
          className="flex gap-1 rounded-full bg-paper p-1"
          onKeyDown={(e) => {
            if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
            e.preventDefault();
            const i = visible.findIndex((t) => t.id === current);
            const n = visible.length;
            const next = e.key === "Home" ? 0 : e.key === "End" ? n - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + n) % n;
            setTab(visible[next].id);
            e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
          }}
        >
          {visible.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={current === t.id}
              tabIndex={current === t.id ? 0 : -1}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${current === t.id ? "bg-ink text-white" : "text-ink/70 hover:text-ink"}`}
            >
              {t.label} <span className="num opacity-70">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {current === "mf" && (
        <div role="tabpanel" aria-label="Mutual funds">
          <ul className="mt-3 divide-y divide-line">
            {mf.map((f) => (
              <li key={f.id}>
                <button
                  onClick={() => setOpen(f)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-paper/60 sm:px-6"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{tidyName(f.name)}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink/60">
                      <PlanBadge plan={f.plan} />
                      <span className="truncate">
                        {f.category?.replace(/^.*? - /, "") ??
                          (f.held_in === "demat"
                            ? "Held in demat"
                            : "Mutual fund")}
                      </span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="num font-semibold">{inr(f.value)}</p>
                    <p
                      className={`num mt-0.5 text-xs font-medium ${tone(f.xirr ?? f.gain)}`}
                    >
                      {f.xirr != null
                        ? `${pct(f.xirr)} a yr`
                        : f.gain != null
                          ? signedInr(f.gain)
                          : `${units(f.units)} units`}
                    </p>
                  </div>
                  <span className="text-ink/30" aria-hidden>
                    ›
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {current === "stocks" && (
        <div role="tabpanel" aria-label="Stocks">
          {/* phones: a list, so nothing scrolls sideways */}
          <ul className="mt-3 divide-y divide-line sm:hidden">
            {stocks.map((s) => (
              <li key={s.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {s.symbol ?? tidyName(s.name)}
                  </p>
                  <p className="num truncate text-xs text-ink/60">
                    {units(s.qty)} ×{" "}
                    {s.price ? inr(s.price, { paise: true }) : "—"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="num font-semibold">{inr(s.value)}</p>
                  {s.day_change != null && (
                    <p
                      className={`num mt-0.5 text-xs font-medium ${tone(s.day_change)}`}
                    >
                      {signedInr(s.day_change)} today
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[34rem] text-sm">
              <thead className="text-left text-xs text-ink/60">
                <tr className="border-b border-line">
                  <th className="px-5 py-2 font-semibold sm:px-6">Stock</th>
                  <th className="px-3 py-2 text-right font-semibold">Qty</th>
                  <th className="px-3 py-2 text-right font-semibold">Price</th>
                  <th className="px-3 py-2 text-right font-semibold">Today</th>
                  <th className="px-5 py-2 text-right font-semibold sm:px-6">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {stocks.map((s) => (
                  <tr key={s.id}>
                    <td className="px-5 py-3 sm:px-6">
                      <p className="font-semibold">
                        {s.symbol ?? tidyName(s.name)}
                      </p>
                      <p className="max-w-[14rem] truncate text-xs text-ink/60">
                        {tidyName(s.name)}
                      </p>
                    </td>
                    <td className="num px-3 py-3 text-right">{units(s.qty)}</td>
                    <td className="num px-3 py-3 text-right">
                      {s.price ? inr(s.price, { paise: true }) : "—"}
                    </td>
                    <td
                      className={`num px-3 py-3 text-right font-medium ${tone(s.day_change)}`}
                    >
                      {s.day_change != null ? signedInr(s.day_change) : "—"}
                    </td>
                    <td className="num px-5 py-3 text-right font-semibold sm:px-6">
                      {inr(s.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {current === "other" && (
        <div role="tabpanel" aria-label="Bonds and NPS">
          <ul className="mt-3 divide-y divide-line">
            {bonds.map((b) => (
              <li
                key={b.id}
                className="flex items-center gap-4 px-5 py-4 sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{tidyName(b.name)}</p>
                  <p className="text-xs text-ink/60">
                    Bond · {units(b.qty)} units
                    {b.coupon ? ` · ${b.coupon}% coupon` : ""}
                    {b.maturity ? ` · matures ${b.maturity}` : ""}
                  </p>
                </div>
                <p className="num font-semibold">{inr(b.value)}</p>
              </li>
            ))}
            {nps?.schemes.map((s) => (
              <li
                key={s.scheme}
                className="flex items-center gap-4 px-5 py-4 sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{s.scheme}</p>
                  <p className="text-xs text-ink/60">
                    NPS{s.tier ? ` · Tier ${s.tier}` : ""}
                  </p>
                </div>
                <p className="num font-semibold">{inr(s.value)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="h-2" />
      {open && <FundSheet fund={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
