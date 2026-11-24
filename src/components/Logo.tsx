export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-xl font-semibold tracking-tight ${className}`}>
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <rect width="32" height="32" rx="9" fill="var(--color-brand)" />
        <path d="M9 22.5V9.5M9 16l7.5-6.5M9 16l8 6.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="22.5" cy="12" r="2.6" fill="var(--color-gold)" />
      </svg>
      Kosh
    </span>
  );
}
