import { z } from "zod";

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
] as const;

const text = (label: string, max = 120) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`);

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address.").max(254));

/** Indian mobile number: 10 digits starting 6–9, optional +91 / 0 prefix. Normalised to 10 digits. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number."));

export const addressSchema = z.object({
  fullName: text("Full name", 80),
  phone: phoneSchema,
  line1: text("Address", 160),
  line2: z.string().trim().max(160).optional().transform((v) => v || undefined),
  city: text("City", 80),
  state: z.enum(INDIAN_STATES, { error: "Select a state." }),
  postalCode: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code."),
});

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use at most 72 characters.");

/** Flattens Zod issues to { field: firstMessage }. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

export function formValues(formData: FormData) {
  return Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;
}
