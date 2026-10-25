"use client";

import { useActionState } from "react";
import { sendContactMessage } from "@/actions/contact";
import type { FormState } from "@/actions/auth";
import { Field, FormMessage } from "@/components/ui/field";
import { buttonClass } from "@/components/ui/button";

export function ContactForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(sendContactMessage, {});
  const f = state.fields ?? {};
  const v = state.values ?? {};
  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2" noValidate>
      <div className="sm:col-span-2"><FormMessage error={state.error} success={state.success} /></div>
      <Field label="Name" name="name" autoComplete="name" required defaultValue={v.name} error={f.name} />
      <Field label="Email" name="email" type="email" autoComplete="email" required defaultValue={v.email} error={f.email} />
      <Field className="sm:col-span-2" label="Order number (optional)" name="orderRef" placeholder="BP-12345678" defaultValue={v.orderRef} error={f.orderRef} />
      <div className="sm:col-span-2">
        <label htmlFor="f-message" className="eyebrow mb-1.5 block">Message</label>
        <textarea
          id="f-message"
          name="message"
          rows={6}
          required
          defaultValue={v.message}
          aria-invalid={f.message ? true : undefined}
          aria-describedby={f.message ? "f-message-error" : undefined}
          className={`w-full rounded-[2px] border bg-white p-4 text-base focus:border-ink-subtle focus:outline-none sm:text-sm ${f.message ? "border-sale" : "border-line"}`}
        />
        {f.message && <p id="f-message-error" className="mt-1 text-xs text-sale">{f.message}</p>}
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonClass("dark")}>{pending ? "Sending…" : "Send message"}</button>
      </div>
    </form>
  );
}
