import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { PasswordForm, ProfileForm } from "@/components/account/profile-forms";

export const metadata: Metadata = { title: "My Profile", robots: { index: false } };

export default function ProfilePage() {
  return (
    <>
      <h1 className="heading-section">Profile</h1>
      <p className="mt-1 mb-6 text-sm text-ink-muted">Manage your personal details and password.</p>
      <Suspense fallback={<div className="h-64 animate-pulse bg-surface" aria-busy="true" />}>
        <Profile />
      </Suspense>
    </>
  );
}

async function Profile() {
  const user = await requireUser("/account/profile");
  return (
    <div className="grid gap-8 xl:grid-cols-2">
      <section className="border border-line p-6">
        <h2 className="label-caps mb-6">Personal details</h2>
        <ProfileForm name={user.name} phone={user.phone ?? ""} email={user.email} />
      </section>
      <section className="border border-line p-6">
        <h2 className="label-caps mb-6">Change password</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
