import { ImageResponse } from "next/og";

export const alt = "Kosh — all your mutual funds and stocks, one honest view";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f6f4ee", padding: 72, fontFamily: "Georgia, serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="76" height="76" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="9" fill="#0b6b4f" />
            <path d="M9 22.5V9.5M9 16l7.5-6.5M9 16l8 6.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="22.5" cy="12" r="2.6" fill="#c08a2b" />
          </svg>
          <span style={{ fontSize: 56, fontWeight: 700, color: "#101412" }}>Kosh</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05, color: "#101412", letterSpacing: -1 }}>All your mutual funds and stocks.</span>
          <span style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05, color: "#0b6b4f", letterSpacing: -1 }}>One honest view.</span>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 28, color: "#3b403d", fontFamily: "Helvetica, Arial, sans-serif" }}>
          {["Free", "Reads your CAS", "Real XIRR", "Regular vs Direct cost"].map((t) => (
            <span key={t} style={{ display: "flex", background: "#fff", border: "2px solid #e6e2d8", borderRadius: 999, padding: "10px 22px" }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
