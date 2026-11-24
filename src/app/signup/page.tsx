import type { Metadata } from "next";
import { SignupForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Create your account · Kosh" };

export default function Page() {
  return <SignupForm />;
}
