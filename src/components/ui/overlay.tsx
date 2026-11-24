"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

/* One set of rules for every dropdown and popup:
   - opening a popup closes any open dropdown
   - Esc closes the top-most thing; a tap outside closes dropdowns
   - dropdowns close when the page changes
   - the page behind a popup doesn't scroll, and focus moves into the popup and back */

const CLOSE_MENUS = "kosh:close-menus";
export const closeMenus = () => window.dispatchEvent(new Event(CLOSE_MENUS));
let openModals = 0;

export function useMenu<T extends HTMLElement>(open: boolean, close: () => void) {
  const ref = useRef<T>(null);
  const path = usePathname();
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });
  useEffect(() => {
    closeRef.current();
  }, [path]);
  useEffect(() => {
    if (!open) return;
    const shut = () => closeRef.current();
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) shut();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openModals === 0) shut();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener(CLOSE_MENUS, shut);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener(CLOSE_MENUS, shut);
    };
  }, [open]);
  return ref;
}

/** Accessible popup: bottom sheet on phones, centred card on larger screens. */
export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  useEffect(() => {
    closeMenus();
    openModals++;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    const before = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      openModals--;
      if (openModals === 0) html.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      before?.focus?.();
    };
  }, []);
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`rise relative max-h-[88svh] w-full overflow-y-auto overscroll-contain rounded-t-3xl bg-card p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl outline-none sm:rounded-3xl ${wide ? "sm:max-w-2xl" : "sm:max-w-md"}`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold leading-tight">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="-mr-2 -mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink/60 hover:bg-paper hover:text-ink">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
