import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getCart } from "@/lib/cart";
import { getProductCards } from "@/lib/catalog";
import { computeTotals } from "@/lib/pricing";
import { formatPrice } from "@/lib/money";
import { ButtonLink } from "@/components/ui/button";
import { CartLineControls } from "@/components/cart/cart-line-controls";
import { FreeShippingMeter, SummaryRows } from "@/components/cart/order-summary";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeader } from "@/components/section-header";

export const metadata: Metadata = { title: "Your Bag", robots: { index: false } };

export default function CartPage() {
  return (
    <>
      <div className="container-page py-10">
        <p className="eyebrow">Shopping bag</p>
        <h1 className="heading-section mt-1">Your bag</h1>
        <Suspense fallback={<div className="mt-8 h-64 animate-pulse bg-surface" aria-busy="true" />}>
          <CartContents />
        </Suspense>
      </div>
      <Recommendations />
    </>
  );
}

async function CartContents() {
  const { lines } = await getCart();
  if (lines.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center border border-line bg-canvas px-6 py-20 text-center">
        <h2 className="text-xl font-medium uppercase">Your bag is empty</h2>
        <p className="mt-2 text-sm text-ink-muted">Discover new arrivals and everyday essentials.</p>
        <div className="mt-6 flex gap-2">
          <ButtonLink href="/new-arrivals" variant="dark">Shop new arrivals</ButtonLink>
          <ButtonLink href="/wishlist" variant="outline">View wishlist</ButtonLink>
        </div>
      </div>
    );
  }

  const totals = computeTotals(lines);
  const blocked = lines.some((l) => l.quantity > l.stock);
  const count = lines.reduce((n, l) => n + l.quantity, 0);

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section aria-label={`${count} items in your bag`}>
        <ul className="divide-y divide-line border-y border-line">
          {lines.map((line) => {
            const short = line.quantity > line.stock;
            return (
              <li key={line.id} className="flex gap-4 py-6">
                <Link href={`/product/${line.product.slug}`} className="relative h-36 w-27 shrink-0 overflow-hidden border border-line bg-stone">
                  <Image src={line.product.image.url} alt={line.product.image.alt} fill sizes="108px" className="object-cover" />
                </Link>
                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-medium">
                        <Link href={`/product/${line.product.slug}`} className="hover:underline">{line.product.name}</Link>
                      </h2>
                      <p className="mt-1 text-xs text-ink-muted">
                        {line.colorName} · Size {line.size} · {formatPrice(line.unitPrice)} each
                      </p>
                    </div>
                    <p className="text-sm font-medium">{formatPrice(line.unitPrice * line.quantity)}</p>
                  </div>
                  {short && (
                    <p role="alert" className="text-xs text-sale">
                      {line.stock === 0 ? "Sold out — please remove this item." : `Only ${line.stock} left — please reduce the quantity.`}
                    </p>
                  )}
                  <CartLineControls
                    lineId={line.id}
                    productId={line.product.id}
                    productName={line.product.name}
                    quantity={line.quantity}
                    stock={line.stock}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        <Link href="/shop" className="label-caps mt-6 inline-block text-ink-muted underline hover:text-ink">Continue shopping</Link>
      </section>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start" aria-label="Order summary">
        <FreeShippingMeter merchandise={totals.subtotal} />
        <div className="border border-line p-6">
          <h2 className="label-caps mb-4">Order summary</h2>
          <SummaryRows {...totals} />
          <p className="mt-3 text-xs text-ink-muted">Discount codes can be applied at checkout.</p>
          {blocked ? (
            <p className="mt-6 text-sm text-sale">Update the highlighted items to continue.</p>
          ) : (
            <ButtonLink href="/checkout" variant="forest" className="mt-6 w-full">
              Proceed to checkout
            </ButtonLink>
          )}
        </div>
      </aside>
    </div>
  );
}

async function Recommendations() {
  const products = await getProductCards({ bestSeller: true }, 4);
  return (
    <section className="border-t border-line bg-canvas py-16" aria-label="Complete your wardrobe">
      <div className="container-page">
        <SectionHeader eyebrow="Curated for you" title="Complete your wardrobe" />
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {products.map((p) => (
            <li key={p.id}><ProductCard product={p} /></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
