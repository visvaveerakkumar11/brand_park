import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { codEnabled } from "@/lib/orders";
import { computeTotals } from "@/lib/pricing";
import { isRazorpayConfigured } from "@/lib/razorpay";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="bg-white py-10">
      <div className="container-page">
        <p className="eyebrow">Secure checkout</p>
        <h1 className="heading-section mt-1">Checkout</h1>
        <Suspense fallback={<div className="mt-8 h-96 animate-pulse bg-surface" aria-busy="true" />}>
          <CheckoutContents />
        </Suspense>
      </div>
    </div>
  );
}

async function CheckoutContents() {
  const [{ lines }, user] = await Promise.all([getCart(), getCurrentUser()]);
  if (lines.length === 0) redirect("/cart");
  if (lines.some((l) => l.quantity > l.stock)) redirect("/cart");

  const addresses = user
    ? await db.address.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        select: { id: true, fullName: true, phone: true, line1: true, line2: true, city: true, state: true, postalCode: true, isDefault: true },
      })
    : [];

  return (
    <div className="mt-8 flex flex-col gap-8">
      {!user && (
        <p className="border border-line bg-canvas px-4 py-3 text-sm text-ink-muted">
          Checking out as a guest.{" "}
          <Link href="/login?next=/checkout" className="text-ink underline">Sign in</Link> to use saved addresses and track orders in your account.
        </p>
      )}
      <details className="border border-line lg:hidden" open>
        <summary className="label-caps cursor-pointer px-4 py-3">Items in your bag ({lines.reduce((n, l) => n + l.quantity, 0)})</summary>
        <ItemList lines={lines} />
      </details>
      <CheckoutForm
          email={user?.email ?? ""}
          signedIn={Boolean(user)}
          addresses={addresses}
          totals={computeTotals(lines)}
          methods={{ razorpay: isRazorpayConfigured(), cod: codEnabled() }}
        />
      <section className="hidden border border-line lg:block" aria-label="Items in your bag">
        <h2 className="label-caps border-b border-line px-6 py-4">Items in your bag</h2>
        <ItemList lines={lines} />
      </section>
    </div>
  );
}

function ItemList({ lines }: { lines: Awaited<ReturnType<typeof getCart>>["lines"] }) {
  return (
    <ul className="divide-y divide-line">
      {lines.map((l) => (
        <li key={l.id} className="flex items-center gap-4 px-4 py-3 sm:px-6">
          <div className="relative h-16 w-12 shrink-0 overflow-hidden border border-line bg-stone">
            <Image src={l.product.image.url} alt="" fill sizes="48px" className="object-cover" />
          </div>
          <div className="flex-1 text-sm">
            <p className="font-medium">{l.product.name}</p>
            <p className="text-xs text-ink-muted">{l.colorName} · Size {l.size} · Qty {l.quantity}</p>
          </div>
          <p className="text-sm">{formatPrice(l.unitPrice * l.quantity)}</p>
        </li>
      ))}
    </ul>
  );
}
