"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { addressSchema, fieldErrors, formValues } from "@/lib/validation";
import type { FormState } from "./auth";

async function userOrLogin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/addresses");
  return user;
}

export async function addAddress(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await userOrLogin();
  const values = formValues(formData);
  const parsed = addressSchema.safeParse(values);
  if (!parsed.success) return { fields: fieldErrors(parsed.error), values };
  const makeDefault = formData.get("isDefault") === "on" || (await db.address.count({ where: { userId: user.id } })) === 0;
  await db.$transaction(async (tx) => {
    if (makeDefault) await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    await tx.address.create({ data: { ...parsed.data, line2: parsed.data.line2 ?? null, userId: user.id, isDefault: makeDefault } });
  });
  refresh();
  return { success: "Address saved." };
}

export async function deleteAddress(addressId: string) {
  const user = await userOrLogin();
  // Scoped to the owner: another user's id simply matches nothing.
  await db.address.deleteMany({ where: { id: String(addressId), userId: user.id } });
  refresh();
}

export async function setDefaultAddress(addressId: string) {
  const user = await userOrLogin();
  await db.$transaction(async (tx) => {
    const owned = await tx.address.count({ where: { id: String(addressId), userId: user.id } });
    if (!owned) return;
    await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    await tx.address.update({ where: { id: String(addressId) }, data: { isDefault: true } });
  });
  refresh();
}
