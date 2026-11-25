"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, ApiError, cachedUser, cacheUser, getToken, SESSION_ENDED, setToken, type User } from "@/lib/api";
import { toast } from "@/components/ui/Toast";

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
          .then((r) => {
            setUser(r.user);
            cacheUser(r.user);
          })
          .catch((e) => {
            // Only a 401 means the session is over. A network blip or a server hiccup keeps you signed in.
            if (e instanceof ApiError && e.status === 401) setToken(null);
            else setUser(cachedUser());
          })
      : Promise.resolve();
    check.finally(() => setReady(true));
  }, []);

  useEffect(() => {
    const ended = () => {
      if (!getToken()) return;
      setToken(null);
      setLeavingTo("/login");
      setUser(null);
      toast.info("Your session has ended. Please log in again.");
    };
    window.addEventListener(SESSION_ENDED, ended);
    return () => window.removeEventListener(SESSION_ENDED, ended);
  }, []);

  const signIn = useCallback((token: string, u: User) => {
    setToken(token);
    cacheUser(u);
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
