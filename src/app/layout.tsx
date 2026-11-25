import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/Auth";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/Toast";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import "./globals.css";

const display = Fraunces({ variable: "--kf-display", subsets: ["latin"], display: "swap", axes: ["opsz"] });
const body = Geist({ variable: "--kf-body", subsets: ["latin"], display: "swap" });
const mono = Geist_Mono({ variable: "--kf-mono", subsets: ["latin"], display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: "%s · Kosh" },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["Kosh", "Kosh portfolio", "Kosh money", "CAS statement", "mutual fund tracker", "portfolio tracker India", "XIRR calculator", "CAMS KFintech CAS", "NSDL CDSL eCAS", "Regular vs Direct plan"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE_NAME, title: SITE_TITLE, description: SITE_DESCRIPTION, url: "/", locale: "en_IN" },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  category: "finance",
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } } : {}),
};

export const viewport: Viewport = { themeColor: "#f6f4ee", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}>
      <body className="min-h-svh">
        <AuthProvider>
          <Suspense fallback={<div className="sticky top-0 z-50 h-16 border-b border-line/70 bg-paper" />}>
            <Header />
          </Suspense>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
