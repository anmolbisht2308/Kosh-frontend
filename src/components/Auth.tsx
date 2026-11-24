"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken, setToken, type User } from "@/lib/api";

type Ctx = {
  user: User | null;
  ready: boolean;
  signIn: (token: string, user: User) => void;
  /** Clears the session. `next` is where the app is headed, so login guards don't bounce to /login first. */
  logout: (next?: string) => void;
  leavingTo: string | null;
};

const AuthCtx = createContext<Ctx | null>(null);
export const useAuth = () => {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [leavingTo, setLeavingTo] = useState<string | null>(null);

  useEffect(() => {
    const check = getToken()
      ? api<{ user: User }>("/api/auth/me")
          .then((r) => setUser(r.user))
          .catch(() => setToken(null))
      : Promise.resolve();
    check.finally(() => setReady(true));
  }, []);

  const signIn = useCallback((token: string, u: User) => {
    setToken(token);
    setLeavingTo(null);
    setUser(u);
  }, []);
  const logout = useCallback((next?: string) => {
    setToken(null);
    setLeavingTo(next ?? null);
    setUser(null);
  }, []);

  return <AuthCtx.Provider value={{ user, ready, signIn, logout, leavingTo }}>{children}</AuthCtx.Provider>;
}
