import type { Metadata } from "next";
import { LoginForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Log in · Kosh" };

export default function Page() {
  return <LoginForm />;
}
