"use client";

import { useEffect, useState } from "react";

type Item = { id: number; kind: "success" | "error" | "info"; text: string };
let push: ((i: Omit<Item, "id">) => void) | null = null;
let seq = 0;

const msg = (x: unknown) => (x instanceof Error ? x.message : typeof x === "string" ? x : "Something went wrong");
export const toast = {
  success: (text: string) => push?.({ kind: "success", text }),
  info: (text: string) => push?.({ kind: "info", text }),
  error: (x: unknown) => push?.({ kind: "error", text: msg(x) }),
};

export function Toaster() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    push = (i) => {
      const id = ++seq;
      setItems((all) => [...all.slice(-2), { ...i, id }]);
      setTimeout(() => setItems((all) => all.filter((x) => x.id !== id)), i.kind === "error" ? 6000 : 3500);
    };
    return () => {
      push = null;
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[90] flex flex-col items-center gap-2 px-4" aria-live="polite">
      {items.map((t) => (
        <div
          key={t.id}
          role={t.kind === "error" ? "alert" : "status"}
          className={`rise pointer-events-auto flex max-w-md items-start gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium shadow-xl ring-1 ${
            t.kind === "error" ? "bg-loss-soft text-loss ring-loss/20" : t.kind === "success" ? "bg-ink text-white ring-ink" : "bg-white text-ink ring-line"
          }`}
        >
          <span aria-hidden>{t.kind === "error" ? "⚠" : t.kind === "success" ? "✓" : "ℹ"}</span>
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}
