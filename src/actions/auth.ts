"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, destroySession, getCurrentUser, hashPassword, safeNext, verifyPassword } from "@/lib/auth";
import { adoptGuestData } from "@/lib/cart";
import { SITE } from "@/lib/config";
import { hashToken, newToken } from "@/lib/tokens";
import { emailSchema, fieldErrors, formValues, passwordSchema, phoneSchema } from "@/lib/validation";

export type FormState = { error?: string; fields?: Record<string, string>; success?: string; values?: Record<string, string> };

// A real bcrypt hash used to keep login timing constant when the email is unknown.
const DUMMY_HASH = "$2b$12$BVStFhlrgLA4leIzTLqaleNuIrs/xsfz4fRcMLmIxeIP/pBNuTsj2";

const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(80),
    email: emailSchema,
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match." });

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) return { fields: fieldErrors(parsed.error), values: { name: values.name ?? "", email: values.email ?? "" } };
  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { fields: { email: "An account with this email already exists." }, values: { name, email } };

  const user = await db.user.create({ data: { name, email, passwordHash: await hashPassword(password) } });
  await createSession(user.id);
  await adoptGuestData(user.id);
  redirect(safeNext(formData.get("next")));
}

const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password.").max(200) });

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) return { fields: fieldErrors(parsed.error), values: { email: values.email ?? "" } };
  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email }, select: { id: true, passwordHash: true } });
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) return { error: "Email or password is incorrect.", values: { email } };

  await createSession(user.id);
  await adoptGuestData(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  await destroySession();
  redirect("/");
}

const RESET_TTL_MINUTES = 60;

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = emailSchema.safeParse(formData.get("email") ?? "");
  if (!parsed.success) return { fields: { email: "Enter a valid email address." } };

  const user = await db.user.findUnique({ where: { email: parsed.data }, select: { id: true } });
  if (user) {
    const token = newToken();
    await db.passwordResetToken.create({
      data: { id: hashToken(token), userId: user.id, expiresAt: new Date(Date.now() + RESET_TTL_MINUTES * 60_000) },
    });
    const link = `${SITE.url}/reset-password?token=${token}`;
    // No email provider is configured yet. In development the link is printed so the flow can be tested.
    if (process.env.NODE_ENV !== "production") console.info(`[password reset] ${parsed.data}: ${link}`);
  }
  // Same response either way, so the form can't be used to discover accounts.
  return { success: "If an account exists for that email, we'll send a link to reset your password." };
}

const resetSchema = z
  .object({ token: z.string().min(1), password: passwordSchema, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match." });

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetSchema.safeParse(formValues(formData));
  if (!parsed.success) return { fields: fieldErrors(parsed.error) };

  const id = hashToken(parsed.data.token);
  const passwordHash = await hashPassword(parsed.data.password);
  const done = await db.$transaction(async (tx) => {
    // Claim the token exactly once.
    const claimed = await tx.passwordResetToken.updateMany({
      where: { id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });
    if (claimed.count === 0) return null;
    const token = await tx.passwordResetToken.findUniqueOrThrow({ where: { id }, select: { userId: true } });
    await tx.user.update({ where: { id: token.userId }, data: { passwordHash } });
    // Sign out everywhere after a reset.
    await tx.session.deleteMany({ where: { userId: token.userId } });
    return token.userId;
  });
  if (!done) return { error: "This reset link is invalid or has expired. Please request a new one." };
  redirect("/login?reset=1");
}

// ------------------------------------------------------------- profile

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  phone: z.union([z.literal(""), phoneSchema]).optional(),
});

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/profile");
  const parsed = profileSchema.safeParse(formValues(formData));
  if (!parsed.success) return { fields: fieldErrors(parsed.error) };
  await db.user.update({ where: { id: user.id }, data: { name: parsed.data.name, phone: parsed.data.phone || null } });
  refresh();
  return { success: "Profile updated." };
}

const passwordChangeSchema = z
  .object({ current: z.string().min(1, "Enter your current password."), password: passwordSchema, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match." });

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/profile");
  const parsed = passwordChangeSchema.safeParse(formValues(formData));
  if (!parsed.success) return { fields: fieldErrors(parsed.error) };
  const record = await db.user.findUniqueOrThrow({ where: { id: user.id }, select: { passwordHash: true } });
  if (!(await verifyPassword(parsed.data.current, record.passwordHash))) {
    return { fields: { current: "Current password is incorrect." } };
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.password) } });
  return { success: "Password changed." };
}
