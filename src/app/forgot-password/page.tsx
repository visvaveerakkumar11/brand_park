import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Forgot Password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthShell eyebrow="Account help" title="Reset password" intro="Enter the email you signed up with and we'll send you a link to choose a new password.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
