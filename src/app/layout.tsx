import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/Auth";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/Toast";
import "./globals.css";

const display = Fraunces({ variable: "--kf-display", subsets: ["latin"], display: "swap", axes: ["opsz"] });
const body = Geist({ variable: "--kf-body", subsets: ["latin"], display: "swap" });
const mono = Geist_Mono({ variable: "--kf-mono", subsets: ["latin"], display: "swap", preload: false });

export const metadata: Metadata = {
  title: "Kosh — all your mutual funds and stocks, one honest view",
  description: "Upload your free CAS statement and see every mutual fund and stock you own in one place: real returns, what Regular plans cost you, and live prices. Free.",
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
