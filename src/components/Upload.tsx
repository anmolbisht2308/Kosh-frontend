"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type DragEvent, type FormEvent } from "react";
import { api, ApiError, type Statement } from "@/lib/api";
import { toast } from "./ui/Toast";

const SOURCES = [
  {
    id: "ecas",
    title: "Stocks + mutual funds",
    tag: "NSDL or CDSL eCAS",
    best: true,
    steps: [
      "If you have a demat account, NSDL or CDSL already emails you this every month. Search your inbox for “Consolidated Account Statement”.",
      "No email? Request it free at nsdl.co.in (NSDL CAS) or cdslindia.com (CDSL eCAS) with your PAN.",
      "Password: your PAN in capitals, e.g. ABCDE1234F.",
    ],
  },
  {
    id: "cams",
    title: "Mutual funds with full history",
    tag: "CAMS + KFintech CAS",
    best: false,
    steps: [
      "Go to camsonline.com → Investors → Statements → CAS - CAMS+KFintech.",
      "Choose “Detailed”, period “Since inception”, and set a password you'll remember.",
      "It arrives by email in a few minutes. This one shows every SIP, so Kosh can work out your true yearly return (XIRR).",
    ],
  },
];

export function Upload() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const pick = (f: File | undefined | null) => {
    setErr(null);
    if (!f) return;
    if (f.type && f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) return setErr("Please choose the CAS PDF file");
    if (f.size > 10 * 1024 * 1024) return setErr("That file is over 10 MB. CAS statements are usually under 2 MB.");
    setFile(f);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    pick(e.dataTransfer.files?.[0]);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return setErr("Choose your CAS PDF first");
    setBusy(true);
    setErr(null);
    const form = new FormData();
    form.append("file", file);
    form.append("password", password);
    try {
      const r = await api<{ statement: Statement }>("/api/statements", { form });
      const c = r.statement.counts ?? {};
      const parts = [c.mf ? `${c.mf} fund${c.mf === 1 ? "" : "s"}` : "", c.stocks ? `${c.stocks} stock${c.stocks === 1 ? "" : "s"}` : "", c.bonds ? `${c.bonds} bond${c.bonds === 1 ? "" : "s"}` : ""].filter(Boolean);
      toast.success(`${r.statement.source_label} statement added${parts.length ? `: ${parts.join(", ")}` : ""}`);
      router.push("/app");
    } catch (x) {
      setErr((x as ApiError).message);
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="eyebrow">Add a statement</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Upload your CAS</h1>
      <p className="mt-2 max-w-2xl text-ink/70">A CAS (Consolidated Account Statement) is free and lists everything you hold. You can add one of each kind; Kosh combines them and never counts a fund twice.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_24rem]">
        <form onSubmit={submit} className="card space-y-5 p-5 sm:p-7">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            className={`relative rounded-3xl border-2 border-dashed p-6 text-center transition ${drag ? "border-brand bg-brand-soft" : file ? "border-brand/40 bg-brand-soft/50" : "border-line bg-paper"}`}
          >
            <input ref={input} id="cas-file" type="file" accept="application/pdf,.pdf" className="peer sr-only" onChange={(e) => pick(e.target.files?.[0])} />
            {file ? (
              <>
                <p className="text-3xl" aria-hidden>
                  ✅
                </p>
                <p className="mt-2 break-all font-semibold">{file.name}</p>
                <p className="text-sm text-ink/60">{(file.size / 1024).toFixed(0)} KB</p>
                <button type="button" onClick={() => input.current?.click()} className="mt-3 text-sm font-semibold text-brand underline-offset-4 hover:underline">
                  Choose a different file
                </button>
              </>
            ) : (
              <>
                <p className="text-3xl" aria-hidden>
                  📄
                </p>
                <p className="mt-2 font-semibold">Drop your CAS PDF here</p>
                <p className="text-sm text-ink/60">or</p>
                <label htmlFor="cas-file" className="btn-ghost mt-2 cursor-pointer peer-focus-visible:outline-[2.5px] peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-brand peer-focus-visible:outline">
                  Choose file
                </label>
              </>
            )}
          </div>

          <div>
            <label htmlFor="pdf-password" className="label">
              PDF password
            </label>
            <div className="relative">
              <input
                id="pdf-password"
                type={show ? "text" : "password"}
                autoComplete="off"
                spellCheck={false}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field pr-20"
                aria-describedby="pdf-password-hint"
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-1.5 text-sm font-semibold text-ink/70 hover:bg-paper" aria-label={show ? "Hide password" : "Show password"}>
                {show ? "Hide" : "Show"}
              </button>
            </div>
            <p id="pdf-password-hint" className="mt-1.5 text-xs text-ink/60">
              NSDL/CDSL: your PAN in capitals. CAMS/KFintech: the password you set when requesting it. Used once to open the file, never saved.
            </p>
          </div>

          {err && (
            <p role="alert" className="rounded-xl bg-loss-soft px-3 py-2.5 text-sm font-medium text-loss">
              {err}
            </p>
          )}
          <button disabled={busy} className="btn-primary w-full">
            {busy ? "Reading your statement…" : "Add to my portfolio"}
          </button>
          <p className="text-center text-xs text-ink/60">🔒 Read in memory, then discarded. We keep only the list of holdings.</p>
        </form>

        <aside className="space-y-4" aria-label="How to get your CAS">
          {SOURCES.map((s) => (
            <div key={s.id} className="card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{s.title}</h2>
                {s.best && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand-deep">Most complete</span>}
              </div>
              <p className="text-sm text-gold-deep">{s.tag}</p>
              <ol className="mt-3 space-y-2 text-sm text-ink/75">
                {s.steps.map((t, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="num mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-paper text-[11px] font-semibold">{i + 1}</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </aside>
      </div>
    </main>
  );
}
