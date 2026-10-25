"use server";

import { z } from "zod";
import { db } from "@/lib/db";

export type NewsletterState = { status: "idle" | "success" | "error"; message: string };

const schema = z.object({ email: z.email().max(254) });

export async function subscribe(_prev: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const parsed = schema.safeParse({ email: String(formData.get("email") ?? "").trim().toLowerCase() });
  if (!parsed.success) return { status: "error", message: "Please enter a valid email address." };
  await db.newsletterSubscriber.upsert({ where: { email: parsed.data.email }, update: {}, create: { email: parsed.data.email } });
  return { status: "success", message: "Thank you — you're on the list." };
}
