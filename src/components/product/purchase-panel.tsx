"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { addToCart } from "@/actions/cart";
import { MAX_LINE_QUANTITY } from "@/lib/config";
import { useSessionState } from "@/components/session-state";
import { buttonClass } from "@/components/ui/button";
import { WishlistButton } from "./wishlist-button";

type Variant = { id: string; size: string; colorName: string; colorHex: string; stock: number };

export function PurchasePanel({ productId, productName, variants }: { productId: string; productName: string; variants: Variant[] }) {
  const router = useRouter();
  const { refreshState } = useSessionState();
  const colors = useMemo(() => {
    const m = new Map<string, string>();
    for (const v of variants) m.set(v.colorName, v.colorHex);
    return [...m].map(([name, hex]) => ({ name, hex }));
  }, [variants]);

  const [color, setColor] = useState(colors[0]?.name ?? "");
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const sizes = variants.filter((v) => v.colorName === color);
  const selected = sizes.find((v) => v.size === size) ?? null;
  const maxQty = selected ? Math.min(selected.stock, MAX_LINE_QUANTITY) : MAX_LINE_QUANTITY;
  const soldOut = sizes.every((v) => v.stock <= 0);

  function submit(thenCheckout: boolean) {
    if (!selected) {
      setFeedback({ tone: "error", text: "Please select a size." });
      return;
    }
    if (selected.stock <= 0) {
      setFeedback({ tone: "error", text: "This size is out of stock." });
      return;
    }
    startTransition(async () => {
      const result = await addToCart({ variantId: selected.id, quantity });
      if (!result.ok) {
        setFeedback({ tone: "error", text: result.error });
        return;
      }
      await refreshState();
      if (thenCheckout) router.push("/checkout");
      else setFeedback({ tone: "success", text: `${productName} (${selected.size}) added to your bag.` });
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {colors.length > 0 && (
        <fieldset>
          <legend className="eyebrow mb-3">
            Colour: <span className="text-ink">{color}</span>
          </legend>
          <div className="flex gap-2">
            {colors.map((c) => (
              <label key={c.name} className="cursor-pointer" title={c.name}>
                <input
                  type="radio"
                  name="color"
                  value={c.name}
                  checked={color === c.name}
                  onChange={() => {
                    setColor(c.name);
                    setSize(null);
                    setFeedback(null);
                  }}
                  className="peer sr-only"
                />
                <span
                  className="block size-9 rounded-full border-2 border-white ring-1 ring-line peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:outline-2 peer-focus-visible:outline-forest"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="sr-only">{c.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <div className="mb-3 flex items-center justify-between">
          <legend className="eyebrow">
            Size{selected && <>: <span className="text-ink">{selected.size}</span></>}
          </legend>
          <Link href="/faq#size-guide" className="label-caps text-ink-muted underline hover:text-ink">Size guide</Link>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {sizes.map((v) => {
            const out = v.stock <= 0;
            return (
              <label key={v.id} className={out ? "cursor-not-allowed" : "cursor-pointer"}>
                <input
                  type="radio"
                  name="size"
                  value={v.size}
                  disabled={out}
                  checked={size === v.size}
                  onChange={() => {
                    setSize(v.size);
                    setQuantity(1);
                    setFeedback(null);
                  }}
                  className="peer sr-only"
                />
                <span className="flex h-11 items-center justify-center rounded-[2px] border border-line text-sm font-medium text-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-forest peer-disabled:bg-surface peer-disabled:text-outline peer-disabled:line-through">
                  {v.size}
                  {out && <span className="sr-only"> (sold out)</span>}
                </span>
              </label>
            );
          })}
        </div>
        <p className="mt-2 min-h-4 text-xs" aria-live="polite">
          {selected && selected.stock > 0 && selected.stock <= 5 && <span className="text-sale">Only {selected.stock} left in this size</span>}
          {soldOut && <span className="text-ink-muted">This colour is currently sold out.</span>}
        </p>
      </fieldset>

      <div className="flex items-center gap-4">
        <span className="eyebrow">Quantity</span>
        <div className="flex h-11 items-center rounded-[2px] border border-line">
          <button
            type="button"
            className="h-full w-10 text-lg disabled:text-outline"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <output className="w-8 text-center text-sm font-medium" aria-live="polite" aria-label="Quantity">{quantity}</output>
          <button
            type="button"
            className="h-full w-10 text-lg disabled:text-outline"
            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            disabled={quantity >= maxQty}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button type="button" onClick={() => submit(false)} disabled={pending || soldOut} className={buttonClass("dark", "flex-1")}>
            {soldOut ? "Sold out" : pending ? "Adding…" : "Add to bag"}
          </button>
          <WishlistButton productId={productId} productName={productName} size="lg" className="size-12 shrink-0 rounded-[2px] border border-line hover:border-ink" />
        </div>
        <button type="button" onClick={() => submit(true)} disabled={pending || soldOut} className={buttonClass("forest", "w-full")}>
          Buy now
        </button>
        <p role="status" className={`min-h-5 text-sm ${feedback?.tone === "error" ? "text-sale" : "text-forest"}`}>
          {feedback?.text}
          {feedback?.tone === "success" && (
            <>
              {" "}
              <Link href="/cart" className="underline">View bag</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
