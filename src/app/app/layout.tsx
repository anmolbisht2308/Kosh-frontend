import type { Metadata } from "next";

// Signed-in pages: nothing here for search engines.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return children;
}
