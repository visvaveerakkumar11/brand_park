"use client";

import { useId, useState, useTransition } from "react";
import { addToCart, toggleWishlist } from "@/actions/cart";
import { useSessionState } from "@/components/session-state";
import { buttonClass } from "@/components/ui/button";

/** Wishlist control: pick a size and move the item into the bag. */
export function MoveToBag({
  productId,
  productName,
  sizes,
}: {
  productId: string;
  productName: string;
  sizes: { variantId: string; size: string; stock: number }[];
}) {
  const id = useId();
  const { refreshState } = useSessionState();
  const [variantId, setVariantId] = useState("");
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const available = sizes.filter((s) => s.stock > 0);

  if (available.length === 0) return <p className="text-xs text-ink-muted">Currently sold out</p>;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <label htmlFor={id} className="sr-only">Size for {productName}</label>
        <select
          id={id}
          value={variantId}
          onChange={(e) => {
            setVariantId(e.target.value);
            setMessage(null);
          }}
          className="h-10 min-w-0 flex-1 rounded-[2px] border border-line bg-white px-2 text-sm"
        >
          <option value="">Size</option>
          {sizes.map((s) => (
            <option key={s.variantId} value={s.variantId} disabled={s.stock <= 0}>
              {s.size}{s.stock <= 0 ? " — sold out" : ""}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={pending}
          className={buttonClass("dark", "h-10 px-4")}
          onClick={() => {
            if (!variantId) {
              setMessage({ error: true, text: "Select a size." });
              return;
            }
            startTransition(async () => {
              const added = await addToCart({ variantId, quantity: 1 });
              if (!added.ok) {
                setMessage({ error: true, text: added.error });
                return;
              }
              await toggleWishlist(productId);
              await refreshState();
            });
          }}
        >
          Move to bag
        </button>
      </div>
      {message && <p role="alert" className={`text-xs ${message.error ? "text-sale" : "text-forest"}`}>{message.text}</p>}
    </div>
  );
}
