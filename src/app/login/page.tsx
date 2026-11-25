import type { Metadata } from "next";
import { LoginForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Log in", alternates: { canonical: "/login" } };

export default function Page() {
  return <LoginForm />;
}
