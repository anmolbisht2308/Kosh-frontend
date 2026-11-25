import type { Metadata } from "next";
import { RecoverForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Recover your account", robots: { index: false, follow: true } };

export default function Page() {
  return <RecoverForm />;
}
