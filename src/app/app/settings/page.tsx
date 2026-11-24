import type { Metadata } from "next";
import { RequireAuth } from "@/components/RequireAuth";
import { Settings } from "@/components/Settings";

export const metadata: Metadata = { title: "Settings · Kosh" };

export default function Page() {
  return (
    <RequireAuth>
      <Settings />
    </RequireAuth>
  );
}
