"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api, API_URL, ApiError, getToken, setToken, type Portfolio, type Statement } from "@/lib/api";
import { dateIN } from "@/lib/format";
import { useAuth } from "./Auth";
import { RecoveryCode } from "./RecoveryCode";
import { Modal } from "./ui/overlay";
import { toast } from "./ui/Toast";

function Section({ title, children, danger }: { title: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <section className={`card p-5 sm:p-6 ${danger ? "ring-loss/25" : ""}`}>
      <h2 className={`font-display text-xl font-semibold ${danger ? "text-loss" : ""}`}>{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function Settings() {
  const { user, logout } = useAuth();
  const [statements, setStatements] = useState<Statement[] | null>(null);
  const [dialog, setDialog] = useState<null | "password" | "recovery" | "delete">(null);

  const load = () =>
    api<Portfolio>("/api/portfolio")
      .then((p) => setStatements(p.empty ? [] : p.statements))
      .catch(() => setStatements([]));
  useEffect(() => {
    load();
  }, []);

  const exportCsv = async () => {
    try {
      const res = await fetch(`${API_URL}/api/portfolio/export.csv`, { headers: { authorization: `Bearer ${getToken()}` } });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Nothing to export yet");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(await res.blob());
      a.download = "kosh-portfolio.csv";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      toast.error(e);
    }
  };

  const remove = async (s: Statement) => {
    if (!confirm(`Remove your ${s.source_label} statement and its holdings from Kosh?`)) return;
    try {
      await api(`/api/statements/${s.family}`, { method: "DELETE" });
      toast.info("Statement removed");
      load();
    } catch (e) {
      toast.error(e);
    }
  };

  return (
    <main className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-6 sm:py-12">
      <div>
        <p className="eyebrow">Settings</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Account & privacy</h1>
      </div>

      <Section title="Your account">
        <p className="text-sm text-ink/70">
          Signed in as <b className="text-ink">{user?.email}</b>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => setDialog("password")} className="btn-ghost">
            Change password
          </button>
          <button onClick={() => setDialog("recovery")} className="btn-ghost">
            New recovery code
          </button>
        </div>
      </Section>

      <Section title="Your statements">
        {statements === null ? (
          <div className="h-16 animate-pulse rounded-2xl bg-paper" />
        ) : statements.length === 0 ? (
          <p className="text-sm text-ink/70">No statements yet.</p>
        ) : (
          <ul className="space-y-2">
            {statements.map((s) => (
              <li key={s.family} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-paper p-3">
                <div className="text-sm">
                  <p className="font-semibold">
                    {s.source_label} {s.family === "rta" ? "CAS" : "eCAS"}
                  </p>
                  <p className="text-ink/60">As of {dateIN(s.period_to)}</p>
                </div>
                <button onClick={() => remove(s)} className="rounded-xl px-3 py-2 text-sm font-semibold text-loss hover:bg-loss-soft">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <button onClick={exportCsv} className="btn-ghost mt-4">
          Download my holdings (CSV)
        </button>
      </Section>

      <Section title="What Kosh keeps">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink/75">
          <li>Your email, your name if you gave one, and a one-way hash of your password and recovery code.</li>
          <li>The holdings read from your statements: fund and stock names, units, folio numbers and transactions.</li>
          <li>Never kept: the PDF itself, its password, your PAN, phone number or address.</li>
          <li>Demat account numbers are shortened to their last 4 digits.</li>
        </ul>
      </Section>

      <Section title="Delete account" danger>
        <p className="text-sm text-ink/70">Deletes your account and every holding we have for you, straight away. This can&apos;t be undone.</p>
        <button onClick={() => setDialog("delete")} className="btn mt-4 bg-loss text-white hover:bg-loss/90">
          Delete my account
        </button>
      </Section>

      {dialog === "password" && <PasswordDialog onClose={() => setDialog(null)} />}
      {dialog === "recovery" && <RecoveryDialog onClose={() => setDialog(null)} />}
      {dialog === "delete" && (
        <DeleteDialog
          onClose={() => setDialog(null)}
          onDeleted={() => {
            logout("/");
            toast.info("Your account and data are deleted");
          }}
        />
      )}
    </main>
  );
}

function PasswordConfirm({ id, value, onChange, label = "Your password" }: { id: string; value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input id={id} type="password" required autoComplete="current-password" value={value} onChange={(e) => onChange(e.target.value)} className="field" />
    </div>
  );
}

function PasswordDialog({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (next.length < 8) return setErr("Use at least 8 characters for your new password");
    setBusy(true);
    setErr(null);
    try {
      const r = await api<{ token: string }>("/api/me/password", { body: { current_password: current, new_password: next } });
      setToken(r.token);
      toast.success("Password changed. Other devices are logged out.");
      onClose();
    } catch (x) {
      setErr((x as ApiError).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="Change password" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <PasswordConfirm id="cur" label="Current password" value={current} onChange={setCurrent} />
        <div>
          <label htmlFor="new" className="label">
            New password
          </label>
          <input id="new" type="password" required minLength={8} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className="field" />
        </div>
        {err && (
          <p role="alert" className="rounded-xl bg-loss-soft px-3 py-2 text-sm font-medium text-loss">
            {err}
          </p>
        )}
        <button disabled={busy} className="btn-primary w-full">
          {busy ? "Saving…" : "Change password"}
        </button>
      </form>
    </Modal>
  );
}

function RecoveryDialog({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await api<{ recovery_code: string }>("/api/me/recovery-code", { body: { password } });
      setCode(r.recovery_code);
    } catch (x) {
      setErr((x as ApiError).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="New recovery code" onClose={onClose}>
      {code ? (
        <RecoveryCode code={code} onDone={onClose} doneLabel="Done" />
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-ink/70">Your old code stops working as soon as you make a new one.</p>
          <PasswordConfirm id="rc-pw" value={password} onChange={setPassword} />
          {err && (
            <p role="alert" className="rounded-xl bg-loss-soft px-3 py-2 text-sm font-medium text-loss">
              {err}
            </p>
          )}
          <button disabled={busy} className="btn-primary w-full">
            {busy ? "Making…" : "Make a new code"}
          </button>
        </form>
      )}
    </Modal>
  );
}

function DeleteDialog({ onClose, onDeleted }: { onClose: () => void; onDeleted: () => void }) {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await api("/api/me/delete", { body: { password } });
      onDeleted();
    } catch (x) {
      setErr((x as ApiError).message);
      setBusy(false);
    }
  };
  return (
    <Modal title="Delete your account?" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-ink/70">Your account, statements and holdings are deleted permanently.</p>
        <PasswordConfirm id="del-pw" value={password} onChange={setPassword} />
        {err && (
          <p role="alert" className="rounded-xl bg-loss-soft px-3 py-2 text-sm font-medium text-loss">
            {err}
          </p>
        )}
        <button disabled={busy} className="btn w-full bg-loss text-white hover:bg-loss/90">
          {busy ? "Deleting…" : "Delete everything"}
        </button>
      </form>
    </Modal>
  );
}
