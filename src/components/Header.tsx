"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./Auth";
import { Logo } from "./Logo";
import { useMenu } from "./ui/overlay";
import { useHydrated } from "@/lib/useHydrated";

const appLinks = [
  { href: "/app", label: "Portfolio" },
  { href: "/app/upload", label: "Add statement" },
];

function AccountMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useMenu<HTMLDivElement>(open, () => setOpen(false));
  if (!user) return null;
  const initial = (user.name || user.email).slice(0, 1).toUpperCase();
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-label="Account" aria-haspopup="menu" aria-expanded={open} className="grid h-10 w-10 place-items-center rounded-full bg-ink font-semibold text-white">
        {initial}
      </button>
      {open && (
        <div role="menu" className="rise absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl bg-white p-1.5 shadow-2xl ring-1 ring-line">
          <p className="truncate px-3 pb-1.5 pt-2 text-xs text-ink/60">{user.email}</p>
          <Link role="menuitem" href="/app" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm hover:bg-paper">
            Portfolio
          </Link>
          <Link role="menuitem" href="/app/upload" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm hover:bg-paper">
            Add a statement
          </Link>
          <Link role="menuitem" href="/app/settings" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm hover:bg-paper">
            Settings & privacy
          </Link>
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout("/");
            }}
            className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-loss hover:bg-loss-soft"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const path = usePathname();
  const auth = useAuth();
  const hydrated = useHydrated();
  const ready = hydrated && auth.ready;
  const user = ready ? auth.user : null;
  const inApp = path.startsWith("/app");
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href={user ? "/app" : "/"} aria-label="Kosh home" className="shrink-0">
          <Logo />
        </Link>
        {user && inApp && (
          <nav aria-label="App" className="hidden items-center gap-1 sm:flex">
            {appLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={path === l.href ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${path === l.href ? "bg-ink text-white" : "text-ink/70 hover:bg-white hover:text-ink"}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-2">
          {!ready ? (
            <span className="h-10 w-24" />
          ) : user ? (
            <>
              {!inApp && (
                <Link href="/app" className="btn-primary min-h-10 px-4 py-2 text-sm">
                  My portfolio
                </Link>
              )}
              <AccountMenu />
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-3 py-2 text-sm font-semibold text-ink/80 hover:text-ink">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary min-h-10 px-4 py-2 text-sm">
                Start free
              </Link>
            </>
          )}
        </div>
      </div>
      {user && inApp && (
        <nav aria-label="App" className="mx-auto flex max-w-6xl gap-1 px-4 pb-2 sm:hidden">
          {appLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={path === l.href ? "page" : undefined}
              className={`flex-1 rounded-full px-3 py-2 text-center text-sm font-semibold ${path === l.href ? "bg-ink text-white" : "bg-white text-ink/70 ring-1 ring-line"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
