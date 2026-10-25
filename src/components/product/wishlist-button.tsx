"use client";

import { useState, useTransition } from "react";
import { toggleWishlist } from "@/actions/cart";
import { HeartFilledIcon, HeartIcon } from "@/components/icons";
import { useSessionState } from "@/components/session-state";

export function WishlistButton({
  productId,
  productName,
  className = "",
  size = "sm",
}: {
  productId: string;
  productName: string;
  className?: string;
  size?: "sm" | "lg";
}) {
  const { wishlistIds, refreshState } = useSessionState();
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const saved = optimistic ?? wishlistIds.includes(productId);

  function onClick() {
    const next = !saved;
    setOptimistic(next);
    startTransition(async () => {
      const result = await toggleWishlist(productId);
      await refreshState();
      setOptimistic(null);
      if (!result.ok) setOptimistic(!next);
    });
  }

  const dims = size === "lg" ? { width: 20, height: 18 } : { width: 15, height: 14 };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      className={`flex items-center justify-center rounded-full transition-colors ${className}`}
    >
      {saved ? <HeartFilledIcon {...dims} className="text-sale" /> : <HeartIcon {...dims} className="text-ink" />}
    </button>
  );
}
