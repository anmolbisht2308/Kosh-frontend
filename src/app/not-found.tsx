import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70svh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-7xl font-semibold text-brand">404</p>
      <h1 className="mt-3 font-display text-3xl font-semibold">Nothing here</h1>
      <p className="mt-2 text-ink/70">That page doesn&apos;t exist. It may have moved, or the link has a typo.</p>
      <div className="mt-7 flex gap-3">
        <Link href="/app" className="btn-primary">
          My portfolio
        </Link>
        <Link href="/" className="btn-ghost">
          Home
        </Link>
      </div>
    </main>
  );
}
