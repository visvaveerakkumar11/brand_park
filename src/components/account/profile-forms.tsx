"use client";

import { useActionState } from "react";
import { changePassword, updateProfile, type FormState } from "@/actions/auth";
import { Field, FormMessage } from "@/components/ui/field";
import { buttonClass } from "@/components/ui/button";

export function ProfileForm({ name, phone, email }: { name: string; phone: string; email: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, {});
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage error={state.error} success={state.success} />
      <Field label="Email" name="email" value={email} readOnly disabled hint="Contact us to change the email on your account." />
      <Field label="Full name" name="name" autoComplete="name" required defaultValue={name} error={state.fields?.name} />
      <Field label="Mobile number" name="phone" type="tel" autoComplete="tel" defaultValue={phone} error={state.fields?.phone} />
      <button type="submit" disabled={pending} className={buttonClass("dark", "w-fit")}>{pending ? "Saving…" : "Save details"}</button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePassword, {});
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage error={state.error} success={state.success} />
      <Field label="Current password" name="current" type="password" autoComplete="current-password" required error={state.fields?.current} />
      <Field label="New password" name="password" type="password" autoComplete="new-password" required hint="At least 8 characters." error={state.fields?.password} />
      <Field label="Confirm new password" name="confirm" type="password" autoComplete="new-password" required error={state.fields?.confirm} />
      <button type="submit" disabled={pending} className={buttonClass("outline", "w-fit")}>{pending ? "Updating…" : "Change password"}</button>
    </form>
  );
}
