import type { Metadata } from "next";
import { Suspense } from "react";
import { getWishlistProductIds } from "@/lib/cart";
import { getProductCardsByIds } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { MoveToBag } from "@/components/cart/move-to-bag";

export const metadata: Metadata = { title: "My Wishlist", robots: { index: false } };

export default function WishlistPage() {
  return (
    <div className="container-page py-10">
      <p className="eyebrow">Saved for later</p>
      <h1 className="heading-display mt-1 uppercase">My wishlist</h1>
      <Suspense fallback={<div className="mt-8 h-64 animate-pulse bg-surface" aria-busy="true" />}>
        <WishlistContents />
      </Suspense>
    </div>
  );
}

async function WishlistContents() {
  const [ids, user] = await Promise.all([getWishlistProductIds(), getCurrentUser()]);
  const products = await getProductCardsByIds(ids);

  return (
    <>
      <p className="mt-3 max-w-xl text-sm text-ink-muted">
        {products.length} {products.length === 1 ? "item" : "items"} saved.
        {!user && products.length > 0 && " Sign in to keep your wishlist across devices."}
      </p>
      {products.length === 0 ? (
        <div className="mt-8 flex flex-col items-center border border-line bg-canvas px-6 py-20 text-center">
          <h2 className="text-xl font-medium uppercase">Nothing saved yet</h2>
          <p className="mt-2 text-sm text-ink-muted">Tap the heart on any product to save it here.</p>
          <ButtonLink href="/shop" variant="dark" className="mt-6">Explore the collection</ButtonLink>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
          {products.map((p) => (
            <li key={p.id} className="flex flex-col gap-3">
              <ProductCard product={p} />
              <MoveToBag productId={p.id} productName={p.name} sizes={p.sizes} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
