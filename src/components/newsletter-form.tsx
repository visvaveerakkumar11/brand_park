"use client";

import { useActionState, useId } from "react";
import { subscribe, type NewsletterState } from "@/actions/newsletter";
import { buttonClass } from "@/components/ui/button";

const initial: NewsletterState = { status: "idle", message: "" };

export function NewsletterForm({ className = "" }: { className?: string }) {
  const [state, action, pending] = useActionState(subscribe, initial);
  const id = useId();
  return (
    <form action={action} className={className} noValidate>
      <div className="flex gap-1">
        <label htmlFor={id} className="sr-only">Email address</label>
        <input
          id={id}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your email address"
          aria-describedby={state.message ? `${id}-msg` : undefined}
          aria-invalid={state.status === "error" || undefined}
          className="h-12 min-w-0 flex-1 rounded-[2px] border border-line bg-white px-4 text-sm text-ink placeholder:text-ink-subtle focus:border-ink-subtle focus:outline-none"
        />
        <button type="submit" disabled={pending} className={buttonClass("forest", "shrink-0 px-6 sm:px-10")}>
          {pending ? "…" : "Subscribe"}
        </button>
      </div>
      <p
        id={`${id}-msg`}
        role="status"
        className={`mt-2 min-h-4 text-xs ${state.status === "error" ? "text-sale" : "text-forest"}`}
      >
        {state.message}
      </p>
    </form>
  );
}
