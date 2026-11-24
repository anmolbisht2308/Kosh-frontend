import type { Insight } from "@/lib/api";
import { inr, tidyName } from "@/lib/format";

export function Insights({ items }: { items: Insight[] }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="ins-h">
      <div className="flex items-end justify-between gap-3">
        <h2 id="ins-h" className="font-display text-xl font-semibold">
          Worth knowing
        </h2>
        <p className="text-xs text-ink/60">Facts about your holdings, not advice</p>
      </div>
      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        {items.map((i, n) => (
          <article key={i.id} className={`card rise min-w-0 p-5 ${i.tone === "warn" ? "ring-gold/50" : ""}`} style={{ animationDelay: `${n * 60}ms` }}>
            <div className="flex items-start gap-3">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg ${i.tone === "warn" ? "bg-gold-soft" : "bg-brand-soft"}`} aria-hidden>
                {i.tone === "warn" ? "⚠" : "ℹ"}
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold leading-snug">{i.title}</h3>
                <p className="mt-1 text-sm text-ink/70">{i.body}</p>
              </div>
            </div>
            {i.rows.length > 0 && (
              <ul className="mt-4 divide-y divide-line rounded-2xl bg-paper px-4">
                {i.rows.slice(0, 6).map((r) => (
                  <li key={r.name} className="flex items-baseline justify-between gap-3 py-2.5 text-sm">
                    <span className="min-w-0 truncate">{tidyName(r.name)}</span>
                    {r.yearly != null ? (
                      <span className="num shrink-0 font-semibold text-gold-deep">≈{inr(r.yearly)}/yr</span>
                    ) : r.value != null ? (
                      <span className="num shrink-0 text-ink/70">{inr(r.value)}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
