import type { Metadata } from "next";
import { RecoverForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Recover your account · Kosh" };

export default function Page() {
  return <RecoverForm />;
}
