import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Sign In", robots: { index: false } };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthShell eyebrow="Welcome back" title="Sign in" intro="Access your orders, saved addresses and wishlist.">
      <Suspense fallback={<div className="h-72 animate-pulse bg-surface" />}>
        <Login searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function Login({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const sp = await searchParams;
  const next = safeNext(typeof sp.next === "string" ? sp.next : null);
  if (await getCurrentUser()) redirect(next);
  return <LoginForm next={next} notice={sp.reset === "1" ? "Your password has been reset. Please sign in." : undefined} />;
}
