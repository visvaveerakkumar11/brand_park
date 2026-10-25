import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrderList } from "@/components/account/order-list";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "My Account", robots: { index: false } };

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse bg-surface" aria-busy="true" />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  const user = await requireUser("/account");
  const [orders, addressCount] = await Promise.all([
    db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, orderNumber: true, status: true, total: true, createdAt: true, _count: { select: { items: true } } },
    }),
    db.address.count({ where: { userId: user.id } }),
  ]);
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="heading-section">Hello, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-ink-muted">{user.email}</p>
      </div>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="label-caps">Recent orders</h2>
          {orders.length > 0 && <Link href="/account/orders" className="label-caps text-ink-muted underline">View all</Link>}
        </div>
        {orders.length ? (
          <OrderList orders={orders} />
        ) : (
          <div className="border border-line bg-canvas p-6 text-sm text-ink-muted">
            You haven&apos;t placed any orders yet.
            <ButtonLink href="/shop" variant="dark" className="mt-4 flex w-fit">Start shopping</ButtonLink>
          </div>
        )}
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/account/addresses" className="border border-line p-6 hover:border-ink-subtle">
          <span className="label-caps block">Addresses</span>
          <span className="mt-1 block text-sm text-ink-muted">{addressCount} saved</span>
        </Link>
        <Link href="/account/profile" className="border border-line p-6 hover:border-ink-subtle">
          <span className="label-caps block">Profile &amp; password</span>
          <span className="mt-1 block text-sm text-ink-muted">Update your details</span>
        </Link>
      </section>
    </div>
  );
}
