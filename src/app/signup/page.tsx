import type { Metadata } from "next";
import { SignupForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Create your free account", alternates: { canonical: "/signup" } };

export default function Page() {
  return <SignupForm />;
}
