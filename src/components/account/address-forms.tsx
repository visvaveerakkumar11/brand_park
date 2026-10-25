"use client";

import { useActionState, useTransition } from "react";
import { addAddress, deleteAddress, setDefaultAddress } from "@/actions/account";
import type { FormState } from "@/actions/auth";
import { INDIAN_STATES } from "@/lib/validation";
import { Field, FormMessage, SelectField } from "@/components/ui/field";
import { buttonClass } from "@/components/ui/button";

export function AddressForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(addAddress, {});
  const f = state.fields ?? {};
  const v = state.values ?? {};
  return (
    // React resets the form after each submit; failed submits re-fill from the echoed values.
    <form action={action} className="grid gap-5 sm:grid-cols-2" noValidate>
      <div className="sm:col-span-2"><FormMessage error={state.error} success={state.success} /></div>
      <Field label="Full name" name="fullName" autoComplete="name" required defaultValue={v.fullName} error={f.fullName} />
      <Field label="Mobile number" name="phone" type="tel" autoComplete="tel" required defaultValue={v.phone} error={f.phone} />
      <Field className="sm:col-span-2" label="Address" name="line1" autoComplete="address-line1" required defaultValue={v.line1} error={f.line1} />
      <Field className="sm:col-span-2" label="Apartment, landmark (optional)" name="line2" autoComplete="address-line2" defaultValue={v.line2} error={f.line2} />
      <Field label="City" name="city" autoComplete="address-level2" required defaultValue={v.city} error={f.city} />
      <SelectField label="State" name="state" placeholder="Select state" options={INDIAN_STATES} required defaultValue={v.state ?? ""} error={f.state} />
      <Field label="PIN code" name="postalCode" inputMode="numeric" maxLength={6} autoComplete="postal-code" required defaultValue={v.postalCode} error={f.postalCode} />
      <label className="flex items-center gap-3 self-end pb-3 text-sm">
        <input type="checkbox" name="isDefault" className="size-4 accent-forest" /> Make this my default address
      </label>
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonClass("dark")}>{pending ? "Saving…" : "Save address"}</button>
      </div>
    </form>
  );
}

export function AddressActions({ id, isDefault }: { id: string; isDefault: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex gap-4">
      {!isDefault && (
        <button type="button" disabled={pending} onClick={() => startTransition(() => setDefaultAddress(id))} className="label-caps text-ink-muted underline hover:text-ink">
          Set as default
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm("Delete this address?")) startTransition(() => deleteAddress(id));
        }}
        className="label-caps text-ink-muted underline hover:text-sale"
      >
        Delete
      </button>
    </div>
  );
}
