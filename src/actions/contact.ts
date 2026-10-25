"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { emailSchema, fieldErrors, formValues } from "@/lib/validation";
import type { FormState } from "./auth";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  email: emailSchema,
  orderRef: z.string().trim().max(20).optional().transform((v) => v || undefined),
  message: z.string().trim().min(10, "Please write at least 10 characters.").max(2000, "Please keep it under 2,000 characters."),
});

export async function sendContactMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  const parsed = schema.safeParse(values);
  if (!parsed.success) return { fields: fieldErrors(parsed.error), values };
  await db.contactMessage.create({ data: { ...parsed.data, orderRef: parsed.data.orderRef ?? null } });
  return { success: "Thanks — your message has been received. We'll reply to the email you provided." };
}
