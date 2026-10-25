"use client";

import { useState, useTransition } from "react";
import { addToCart } from "@/actions/cart";
import { useSessionState } from "@/components/session-state";

/** Hover drawer on product cards: add a size straight to the bag. */
export function QuickAdd({ sizes, productName }: { sizes: { variantId: string; size: string; stock: number }[]; productName: string }) {
  const { refreshState } = useSessionState();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function add(variantId: string) {
    startTransition(async () => {
      const result = await addToCart({ variantId, quantity: 1 });
      setMessage(result.ok ? "Added to bag" : result.error);
      if (result.ok) await refreshState();
    });
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full border-t border-line bg-white/95 px-3 py-2 opacity-0 transition duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 max-lg:hidden">
      {message ? (
        <p role="status" className="label-caps py-2 text-center text-forest">{message}</p>
      ) : (
        <div role="group" aria-label={`Quick add ${productName}`} className="flex flex-wrap items-center justify-center gap-1">
          <span className="label-caps mr-1 text-ink-subtle">Add</span>
          {sizes.map((s) => (
            <button
              key={s.variantId}
              type="button"
              disabled={pending || s.stock <= 0}
              onClick={() => add(s.variantId)}
              aria-label={`Add size ${s.size} to bag${s.stock <= 0 ? " (sold out)" : ""}`}
              className="h-8 min-w-8 rounded-[2px] border border-line px-1.5 text-[11px] font-medium text-ink hover:border-ink disabled:cursor-not-allowed disabled:text-outline disabled:line-through"
            >
              {s.size}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
