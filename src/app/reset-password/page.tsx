import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Choose a New Password", robots: { index: false } };

export default function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  return (
    <AuthShell eyebrow="Account help" title="New password" intro="Choose a new password for your Brand Park account.">
      <Suspense fallback={<div className="h-56 animate-pulse bg-surface" />}>
        <Reset searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function Reset({ searchParams }: { searchParams: PageProps<"/reset-password">["searchParams"] }) {
  const { token } = await searchParams;
  if (typeof token !== "string" || !token) {
    return (
      <p className="text-sm text-ink-muted">
        This link is incomplete. <Link href="/forgot-password" className="underline">Request a new reset link</Link>.
      </p>
    );
  }
  return <ResetPasswordForm token={token} />;
}
