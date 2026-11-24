"use client";

import { useState } from "react";
import { toast } from "./ui/Toast";

/** Shown once after sign-up or recovery. It's the only way back in if the password is forgotten. */
export function RecoveryCode({ code, onDone, doneLabel = "Continue" }: { code: string; onDone: () => void; doneLabel?: string }) {
  const [saved, setSaved] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Recovery code copied");
    } catch {
      toast.info("Select the code and copy it by hand");
    }
  };
  const download = () => {
    const blob = new Blob([`Kosh recovery code\n\n${code}\n\nUse this with your email to set a new password if you forget it.\nKeep it somewhere safe. Anyone with it and your email can get into your Kosh account.\n`], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "kosh-recovery-code.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className="rise">
      <p className="eyebrow">One more step</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">Save your recovery code</h1>
      <p className="mt-2 text-ink/70">If you ever forget your password, this code and your email get you back in. We can&apos;t show it again.</p>
      <div className="mt-5 rounded-2xl border-2 border-dashed border-gold/60 bg-gold-soft p-5 text-center">
        <p className="num select-all font-mono text-2xl font-semibold tracking-[0.18em] text-ink sm:text-3xl" aria-label={`Recovery code ${code.split("").join(" ")}`}>
          {code}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={copy} className="btn-ghost">
          Copy
        </button>
        <button type="button" onClick={download} className="btn-ghost">
          Download
        </button>
      </div>
      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl bg-paper p-4 text-sm">
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[var(--color-brand)]" />
        I&apos;ve saved my recovery code somewhere safe
      </label>
      <button onClick={onDone} disabled={!saved} className="btn-primary mt-4 w-full">
        {doneLabel}
      </button>
    </div>
  );
}
