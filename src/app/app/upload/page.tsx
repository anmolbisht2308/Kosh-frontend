import type { Metadata } from "next";
import { RequireAuth } from "@/components/RequireAuth";
import { Upload } from "@/components/Upload";

export const metadata: Metadata = { title: "Add a statement · Kosh" };

export default function Page() {
  return (
    <RequireAuth>
      <Upload />
    </RequireAuth>
  );
}
