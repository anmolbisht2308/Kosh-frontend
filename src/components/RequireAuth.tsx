"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "./Auth";
import { useHydrated } from "@/lib/useHydrated";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready: authReady, leavingTo } = useAuth();
  const ready = useHydrated() && authReady;
  const router = useRouter();
  useEffect(() => {
    if (ready && !user) router.replace(leavingTo ?? "/login");
  }, [ready, user, router, leavingTo]);
  if (!ready || !user)
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-busy="true">
        <div className="h-40 animate-pulse rounded-3xl bg-white/70" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="h-28 animate-pulse rounded-3xl bg-white/70" />
          <div className="h-28 animate-pulse rounded-3xl bg-white/70" />
          <div className="h-28 animate-pulse rounded-3xl bg-white/70" />
        </div>
      </main>
    );
  return <>{children}</>;
}
