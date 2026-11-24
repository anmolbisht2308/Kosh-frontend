"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { api, ApiError, type User } from "@/lib/api";
import { useAuth } from "./Auth";
import { RecoveryCode } from "./RecoveryCode";

type AuthResult = { token: string; user: User; recovery_code?: string };

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-md flex-col justify-center px-4 py-10 sm:px-6">
      <div className="card p-6 sm:p-8">{children}</div>
      <p className="mt-6 text-center text-xs text-ink/60">🔒 Passwords are stored as a one-way hash. Your statements are read in memory and never saved.</p>
    </main>
  );
}

function PasswordField({ id, label, value, onChange, autoComplete, hint }: { id: string; label: string; value: string; onChange: (v: string) => void; autoComplete: string; hint?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="relative">
        <input id={id} type={show ? "text" : "password"} required minLength={autoComplete === "new-password" ? 8 : undefined} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} className="field pr-20" aria-describedby={hint ? `${id}-hint` : undefined} />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-1.5 text-sm font-semibold text-ink/70 hover:bg-paper" aria-label={show ? "Hide password" : "Show password"}>
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink/60">
          {hint}
        </p>
      )}
    </div>
  );
}

function useRedirectIfSignedIn() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (ready && user && !busy) router.replace("/app");
  }, [ready, user, busy, router]);
  return setBusy;
}

export function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useRedirectIfSignedIn();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await api<AuthResult>("/api/auth/login", { body: { email, password }, auth: false });
      signIn(r.token, r.user);
      router.push("/app");
    } catch (x) {
      setErr((x as ApiError).message);
      setBusy(false);
    }
  };
  return (
    <Shell>
      <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
      <p className="mt-1 text-ink/70">Log in to see your portfolio.</p>
      <form onSubmit={submit} className="mt-6 space-y-4" noValidate={false}>
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
        </div>
        <PasswordField id="password" label="Password" value={password} onChange={setPassword} autoComplete="current-password" />
        {err && (
          <p role="alert" className="rounded-xl bg-loss-soft px-3 py-2 text-sm font-medium text-loss">
            {err}
          </p>
        )}
        <button disabled={busy} className="btn-primary w-full">
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
      <div className="mt-5 flex flex-wrap justify-between gap-2 text-sm">
        <Link href="/recover" className="font-semibold text-brand underline-offset-4 hover:underline">
          Forgot password?
        </Link>
        <span className="text-ink/70">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-brand underline-offset-4 hover:underline">
            Create an account
          </Link>
        </span>
      </div>
    </Shell>
  );
}

export function SignupForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AuthResult | null>(null);
  const holdRedirect = useRedirectIfSignedIn();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setErr("Use at least 8 characters for your password");
    setBusy(true);
    setErr(null);
    try {
      const r = await api<AuthResult>("/api/auth/signup", { body: { email, password, name: name || undefined }, auth: false });
      holdRedirect(true); // stay here to show the recovery code first
      setResult(r);
    } catch (x) {
      setErr((x as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  if (result?.recovery_code)
    return (
      <Shell>
        <RecoveryCode
          code={result.recovery_code}
          doneLabel="Go to my portfolio"
          onDone={() => {
            signIn(result.token, result.user);
            router.push("/app");
          }}
        />
      </Shell>
    );

  return (
    <Shell>
      <h1 className="font-display text-3xl font-semibold">Create your free account</h1>
      <p className="mt-1 text-ink/70">Takes 30 seconds. No card, no phone number.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="label">
            Your name <span className="font-normal text-ink/60">(optional)</span>
          </label>
          <input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className="field" />
        </div>
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
        </div>
        <PasswordField id="password" label="Password" value={password} onChange={setPassword} autoComplete="new-password" hint="At least 8 characters. A short sentence is easy to remember and hard to guess." />
        <label className="flex cursor-pointer items-start gap-3 text-sm text-ink/80">
          <input type="checkbox" required checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-brand)]" />
          <span>
            I understand Kosh shows information about my own investments and is <b>not investment advice</b>.
          </span>
        </label>
        {err && (
          <p role="alert" className="rounded-xl bg-loss-soft px-3 py-2 text-sm font-medium text-loss">
            {err}
          </p>
        )}
        <button disabled={busy} className="btn-primary w-full">
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-5 text-sm text-ink/70">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </Shell>
  );
}

export function RecoverForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AuthResult | null>(null);
  const holdRedirect = useRedirectIfSignedIn();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setErr("Use at least 8 characters for your new password");
    setBusy(true);
    setErr(null);
    try {
      const r = await api<AuthResult>("/api/auth/recover", { body: { email, recovery_code: code, new_password: password }, auth: false });
      holdRedirect(true);
      setResult(r);
    } catch (x) {
      setErr((x as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  if (result?.recovery_code)
    return (
      <Shell>
        <p className="mb-4 rounded-xl bg-brand-soft px-3 py-2 text-sm font-medium text-brand-deep">✓ Password changed. Your old recovery code no longer works.</p>
        <RecoveryCode
          code={result.recovery_code}
          doneLabel="Go to my portfolio"
          onDone={() => {
            signIn(result.token, result.user);
            router.push("/app");
          }}
        />
      </Shell>
    );

  return (
    <Shell>
      <h1 className="font-display text-3xl font-semibold">Forgot your password?</h1>
      <p className="mt-1 text-ink/70">Use the recovery code you saved when you signed up.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
        </div>
        <div>
          <label htmlFor="code" className="label">
            Recovery code
          </label>
          <input id="code" required autoComplete="off" spellCheck={false} placeholder="XXXX-XXXX-XXXX" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="field font-mono tracking-widest" />
        </div>
        <PasswordField id="password" label="New password" value={password} onChange={setPassword} autoComplete="new-password" hint="At least 8 characters." />
        {err && (
          <p role="alert" className="rounded-xl bg-loss-soft px-3 py-2 text-sm font-medium text-loss">
            {err}
          </p>
        )}
        <button disabled={busy} className="btn-primary w-full">
          {busy ? "Checking…" : "Set new password"}
        </button>
      </form>
      <p className="mt-5 text-sm text-ink/70">
        Lost the code too? For your safety we can&apos;t reset it another way. You can{" "}
        <Link href="/signup" className="font-semibold text-brand underline-offset-4 hover:underline">
          create a new account
        </Link>{" "}
        and upload your statement again in a minute.
      </p>
    </Shell>
  );
}
