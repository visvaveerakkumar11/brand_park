"use client";

import { useState, useTransition } from "react";
import { removeCartLine, toggleWishlist, updateCartLine } from "@/actions/cart";
import { MAX_LINE_QUANTITY } from "@/lib/config";
import { useSessionState } from "@/components/session-state";

export function CartLineControls({
  lineId,
  productId,
  productName,
  quantity,
  stock,
}: {
  lineId: string;
  productId: string;
  productName: string;
  quantity: number;
  stock: number;
}) {
  const { refreshState, wishlistIds } = useSessionState();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const max = Math.min(Math.max(stock, 1), MAX_LINE_QUANTITY);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      setError(null);
      const result = await fn();
      if (!result.ok) setError(result.error ?? "Something went wrong.");
      await refreshState();
    });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-9 items-center rounded-[2px] border border-line" aria-busy={pending}>
          <button
            type="button"
            className="h-full w-9 disabled:text-outline"
            disabled={pending || quantity <= 1}
            onClick={() => run(() => updateCartLine({ lineId, quantity: quantity - 1 }))}
            aria-label={`Decrease quantity of ${productName}`}
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-medium" aria-label={`Quantity ${quantity}`}>{quantity}</span>
          <button
            type="button"
            className="h-full w-9 disabled:text-outline"
            disabled={pending || quantity >= max}
            onClick={() => run(() => updateCartLine({ lineId, quantity: quantity + 1 }))}
            aria-label={`Increase quantity of ${productName}`}
          >
            +
          </button>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => removeCartLine(lineId))}
          className="label-caps text-ink-muted underline hover:text-ink"
        >
          Remove
        </button>
        {!wishlistIds.includes(productId) && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(async () => {
                const saved = await toggleWishlist(productId);
                return saved.ok ? removeCartLine(lineId) : saved;
              })
            }
            className="label-caps text-ink-muted underline hover:text-ink"
          >
            Move to wishlist
          </button>
        )}
      </div>
      {error && <p role="alert" className="text-xs text-sale">{error}</p>}
    </div>
  );
}
