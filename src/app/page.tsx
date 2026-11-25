import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

const steps = [
  { n: "1", title: "Get your free CAS", text: "NSDL or CDSL emails it to demat holders every month. CAMS sends a mutual-fund one in minutes. Both are free." },
  { n: "2", title: "Upload the PDF", text: "Add the password (usually your PAN). We read it in memory and throw the file away." },
  { n: "3", title: "See everything", text: "Every fund and stock in one place, valued at today's prices, with the costs and returns you can't see anywhere else." },
];

const icons: Record<string, React.ReactNode> = {
  growth: <path d="M4 17l5-5 4 4 7-8M15 8h5v5" />,
  receipt: <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6M9 16h3" />,
  layers: <path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5" />,
  refresh: <path d="M20 11a8 8 0 0 0-14.6-4.5M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5M20 20v-4h-4" />,
};

function Icon({ name }: { name: string }) {
  return (
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand" aria-hidden>
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {icons[name]}
      </svg>
    </span>
  );
}

const features = [
  { icon: "growth", title: "Your real yearly return", text: "XIRR on every fund, worked out from each SIP and redemption, not a rough average." },
  { icon: "receipt", title: "What commissions cost you", text: "If you hold Regular plans, see roughly how much less they returned than the Direct plan of the same fund, in rupees a year." },
  { icon: "layers", title: "Funds and shares together", text: "Mutual funds from CAMS and KFintech plus stocks, bonds and NPS from your demat, counted once." },
  { icon: "refresh", title: "Fresh prices every day", text: "Fund NAVs from AMFI and stock closing prices from NSE, updated automatically." },
];

const privacy = [
  "Your PDF and its password are never stored",
  "No PAN, phone number or address kept",
  "No bank or broker login, ever",
  "Delete everything in one click",
];

const faqs = [
  {
    q: "What is Kosh?",
    a: "Kosh (कोश, \u201ctreasury\u201d) is a free portfolio tracker for Indian investors. Upload the CAS statement from CAMS, KFintech, NSDL or CDSL and Kosh shows all your mutual funds and stocks in one place, valued at today's prices.",
  },
  {
    q: "Is it really free?",
    a: "Yes. Kosh uses free public data (AMFI and NSE) and the free statement you already get, so there's nothing to pay for.",
  },
  {
    q: "Do you need my broker or bank login?",
    a: "No. Kosh never connects to your broker, bank or mutual fund accounts. It only reads the statement you upload, so it can't buy, sell or move anything.",
  },
  {
    q: "What's a CAS?",
    a: "A Consolidated Account Statement. It lists all your mutual funds across every fund house, and (from NSDL/CDSL) your demat shares too. SEBI requires it to be available free to every investor.",
  },
  {
    q: "Will Kosh tell me what to buy?",
    a: "No. Kosh shows facts about what you already own: values, returns, costs and how concentrated you are. It isn't a registered adviser and doesn't give investment advice.",
  },
  {
    q: "How up to date is it?",
    a: "Prices update daily. Your holdings are as of your latest statement, so upload a fresh one after you buy or sell.",
  },
];

function Preview() {
  const rows = [
    { name: "Parag Parikh Flexi Cap", plan: "Direct", value: "₹4,61,509", ret: "+17.1%" },
    { name: "HDFC Mid Cap", plan: "Regular", value: "₹2,36,784", ret: "+18.9%" },
    { name: "SBI Large Cap", plan: "Regular", value: "₹1,33,720", ret: "+10.9%" },
  ];
  return (
    <div className="relative" aria-hidden>
      <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-brand-soft via-transparent to-gold-soft blur-2xl" />
      <div className="rounded-[2rem] bg-ink p-6 text-white shadow-2xl">
        <p className="text-sm text-white/70">Sample portfolio</p>
        <p className="num mt-1 font-display text-4xl font-semibold">₹14,33,717</p>
        <p className="mt-2 text-sm text-white/80">
          Funds growing at <b className="text-white">+14.4%</b> a year
        </p>
        <div className="mt-5 flex h-3 gap-[2px] overflow-hidden rounded-full">
          <span className="w-[67%] bg-a-equity" />
          <span className="w-[24%] bg-a-stocks" />
          <span className="w-[9%] bg-a-debt" />
        </div>
      </div>
      <div className="-mt-4 ml-4 mr-2 rounded-3xl bg-white p-4 shadow-xl ring-1 ring-line sm:ml-10">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-0">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{r.name}</p>
              <span className={`text-[11px] font-semibold ${r.plan === "Direct" ? "text-brand-deep" : "text-gold-deep"}`}>{r.plan}</span>
            </div>
            <div className="text-right">
              <p className="num text-sm font-semibold">{r.value}</p>
              <p className="num text-xs text-gain">{r.ret} a yr</p>
            </div>
          </div>
        ))}
        <div className="mt-2 rounded-2xl bg-gold-soft px-3 py-2.5 text-xs">
          <b>⚠ Regular plans cost you about ₹3,676 a year</b>
        </div>
      </div>
    </div>
  );
}

function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: "Kosh", alternateName: ["Kosh portfolio tracker", "Kosh Money"], url: `${SITE_URL}/`, inLanguage: "en-IN", publisher: { "@id": `${SITE_URL}/#org` } },
      { "@type": "Organization", "@id": `${SITE_URL}/#org`, name: "Kosh", url: `${SITE_URL}/`, logo: `${SITE_URL}/icon-512.png` },
      {
        "@type": "WebApplication",
        name: "Kosh",
        url: `${SITE_URL}/`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        description: SITE_DESCRIPTION,
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        publisher: { "@id": `${SITE_URL}/#org` },
      },
      { "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export default function Landing() {
  return (
    <main className="overflow-x-clip">
      <StructuredData />
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pb-24 md:pt-16">
        <div className="rise">
          <p className="eyebrow">Kosh · free for every Indian investor</p>
          <h1 className="mt-3 font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            All your mutual funds and stocks. <span className="text-brand">One honest view.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink/75">Upload the free CAS statement you already get. See what everything is worth today, your true return, and what Regular plans quietly cost you.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn-primary px-6 text-base">
              Start free
            </Link>
            <a href="#how" className="btn-ghost px-6 text-base">
              How it works
            </a>
          </div>
          <p className="mt-4 text-sm text-ink/60">No broker login · No card · Not investment advice</p>
          <div className="mt-8 border-t border-line pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/65">Reads statements from</p>
            <ul className="mt-2.5 flex flex-wrap gap-2 text-sm font-semibold text-ink/70">
              {["CAMS", "KFintech", "NSDL", "CDSL"].map((x) => (
                <li key={x} className="rounded-full bg-white px-3 py-1 ring-1 ring-line">
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Preview />
      </section>

      <section id="how" className="border-y border-line bg-white/60 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Three steps, about two minutes</h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n} className="card p-6">
                <span className="num grid h-10 w-10 place-items-center rounded-full bg-brand font-semibold text-white">{s.n}</span>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-ink/70">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <p className="eyebrow">What you&apos;ll see</p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">The numbers your app and your distributor don&apos;t show you</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="card flex gap-4 p-6">
              <Icon name={f.icon} />
              <div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-ink/70">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink py-16 text-white md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Private by design</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Your statement is read, not kept</h2>
            <p className="mt-4 text-white/75">Kosh opens your PDF in memory, pulls out the list of holdings, and discards the file. It can&apos;t trade, can&apos;t withdraw, and never sees your bank.</p>
          </div>
          <ul className="grid gap-3 self-center">
            {privacy.map((p) => (
              <li key={p} className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                <span className="text-[#7be0b3]" aria-hidden>
                  ✓
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Questions about Kosh</h2>
        <div className="mt-8 divide-y divide-line rounded-3xl bg-white ring-1 ring-line">
          {faqs.map((f) => (
            <details key={f.q} className="group px-5 py-4 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {f.q}
                <span className="text-xl text-ink/50 transition group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-2 text-ink/75">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="rounded-[2rem] bg-brand px-6 py-12 text-center text-white sm:px-12">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">See your whole portfolio in two minutes</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">Free. No broker login. Try it with a sample portfolio first if you like.</p>
          <Link href="/signup" className="btn mt-7 bg-white px-6 text-base text-brand-deep hover:bg-paper">
            Create free account
          </Link>
        </div>
      </section>

      <footer className="border-t border-line py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 text-sm text-ink/60 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-col gap-2">
            <Logo className="text-base text-ink" />
            <nav aria-label="Footer" className="flex gap-4">
              <Link href="/signup" className="hover:text-ink">Sign up</Link>
              <Link href="/login" className="hover:text-ink">Log in</Link>
              <a href="#how" className="hover:text-ink">How it works</a>
              <a href="#faq" className="hover:text-ink">FAQ</a>
            </nav>
          </div>
          <p className="max-w-xl">Kosh shows information about your own investments. It is not a SEBI-registered investment adviser and nothing here is investment advice. Prices: AMFI and NSE, end of day.</p>
        </div>
      </footer>
    </main>
  );
}
