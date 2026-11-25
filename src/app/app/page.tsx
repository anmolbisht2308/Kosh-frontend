import type { Metadata } from "next";
import { RequireAuth } from "@/components/RequireAuth";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const metadata: Metadata = { title: "My portfolio" };

export default function Page() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}
