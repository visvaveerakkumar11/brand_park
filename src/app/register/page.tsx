import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Create Account", robots: { index: false } };

export default function RegisterPage({ searchParams }: PageProps<"/register">) {
  return (
    <AuthShell eyebrow="Join Brand Park" title="Create account" intro="Save your details for faster checkout and track every order.">
      <Suspense fallback={<div className="h-96 animate-pulse bg-surface" />}>
        <Register searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function Register({ searchParams }: { searchParams: PageProps<"/register">["searchParams"] }) {
  const sp = await searchParams;
  const next = safeNext(typeof sp.next === "string" ? sp.next : null);
  if (await getCurrentUser()) redirect(next);
  return <RegisterForm next={next} />;
}
