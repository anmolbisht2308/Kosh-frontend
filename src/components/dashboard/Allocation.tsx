"use client";

import { useState } from "react";
import { ASSET_COLOR, ASSET_LABEL, ASSET_ORDER, inr, share } from "@/lib/format";

type Slice = { key: string; label: string; value: number; share: number };

/** Gold, bonds and NPS fold into "Other" so the bar never needs more than 5 colours. */
function fold(allocation: Slice[]) {
  const map = new Map<string, number>();
  let total = 0;
  for (const a of allocation) {
    const k = (ASSET_ORDER as readonly string[]).includes(a.key) ? a.key : "other";
    map.set(k, (map.get(k) ?? 0) + a.value);
    total += a.value;
  }
  return ASSET_ORDER.filter((k) => (map.get(k) ?? 0) > 0).map((k) => ({ key: k, label: ASSET_LABEL[k], value: map.get(k)!, share: total ? map.get(k)! / total : 0 }));
}

/** Tall segmented bar + a legend that doubles as the table view (name, value, share). */
export function Allocation({ allocation }: { allocation: Slice[] }) {
  const parts = fold(allocation);
  const [hover, setHover] = useState<string | null>(null);
  if (!parts.length) return null;
  return (
    <section className="card p-5 sm:p-6" aria-labelledby="alloc-h">
      <h2 id="alloc-h" className="font-display text-xl font-semibold">
        Where your money is
      </h2>
      <div className="mt-4 flex h-12 w-full gap-[2px] overflow-hidden rounded-2xl" role="img" aria-label={parts.map((p) => `${p.label} ${share(p.share)}`).join(", ")}>
        {parts.map((p) => (
          <div
            key={p.key}
            className="group relative h-full rounded-[4px] transition-opacity first:rounded-l-2xl last:rounded-r-2xl"
            style={{ width: `${Math.max(p.share * 100, 1.5)}%`, background: ASSET_COLOR[p.key], opacity: hover && hover !== p.key ? 0.35 : 1 }}
            onMouseEnter={() => setHover(p.key)}
            onMouseLeave={() => setHover(null)}
            title={`${p.label}: ${inr(p.value)} (${share(p.share)})`}
          />
        ))}
      </div>
      <ul className="mt-5 grid gap-y-1">
        {parts.map((p) => (
          <li key={p.key} className={`flex items-center gap-3 rounded-xl px-2 py-1.5 transition ${hover === p.key ? "bg-paper" : ""}`} onMouseEnter={() => setHover(p.key)} onMouseLeave={() => setHover(null)}>
            <span className="h-3 w-3 shrink-0 rounded-[3px]" style={{ background: ASSET_COLOR[p.key] }} aria-hidden />
            <span className="flex-1 text-sm font-medium">{p.label}</span>
            <span className="num text-sm text-ink/70">{inr(p.value)}</span>
            <span className="num w-12 text-right text-sm font-semibold">{share(p.share)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
