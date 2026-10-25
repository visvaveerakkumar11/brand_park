"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register, requestPasswordReset, resetPassword, type FormState } from "@/actions/auth";
import { Field, FormMessage } from "@/components/ui/field";
import { buttonClass } from "@/components/ui/button";

const initial: FormState = {};

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState(login, initial);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage error={state.error} success={!state.error ? notice : undefined} />
      <input type="hidden" name="next" value={next} />
      <Field label="Email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} error={state.fields?.email} />
      <Field label="Password" name="password" type="password" autoComplete="current-password" required error={state.fields?.password} />
      <div className="-mt-2 text-right">
        <Link href="/forgot-password" className="text-xs text-ink-muted underline hover:text-ink">Forgot password?</Link>
      </div>
      <button type="submit" disabled={pending} className={buttonClass("dark", "w-full")}>{pending ? "Signing in…" : "Sign in"}</button>
      <p className="text-center text-sm text-ink-muted">
        New to Brand Park? <Link href={`/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-ink underline">Create an account</Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(register, initial);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage error={state.error} />
      <input type="hidden" name="next" value={next} />
      <Field label="Full name" name="name" autoComplete="name" required defaultValue={state.values?.name} error={state.fields?.name} />
      <Field label="Email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} error={state.fields?.email} />
      <Field label="Password" name="password" type="password" autoComplete="new-password" required hint="At least 8 characters." error={state.fields?.password} />
      <Field label="Confirm password" name="confirm" type="password" autoComplete="new-password" required error={state.fields?.confirm} />
      <button type="submit" disabled={pending} className={buttonClass("dark", "w-full")}>{pending ? "Creating account…" : "Create account"}</button>
      <p className="text-center text-sm text-ink-muted">
        Already have an account? <Link href="/login" className="text-ink underline">Sign in</Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage error={state.error} success={state.success} />
      <Field label="Email" name="email" type="email" autoComplete="email" required error={state.fields?.email} />
      <button type="submit" disabled={pending} className={buttonClass("dark", "w-full")}>{pending ? "Sending…" : "Send reset link"}</button>
      <p className="text-center text-sm text-ink-muted">
        <Link href="/login" className="underline">Back to sign in</Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, initial);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage error={state.error} />
      <input type="hidden" name="token" value={token} />
      <Field label="New password" name="password" type="password" autoComplete="new-password" required hint="At least 8 characters." error={state.fields?.password} />
      <Field label="Confirm password" name="confirm" type="password" autoComplete="new-password" required error={state.fields?.confirm} />
      <button type="submit" disabled={pending} className={buttonClass("dark", "w-full")}>{pending ? "Saving…" : "Set new password"}</button>
    </form>
  );
}
