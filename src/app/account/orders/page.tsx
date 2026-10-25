import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrderList } from "@/components/account/order-list";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "My Orders", robots: { index: false } };

export default function OrdersPage() {
  return (
    <>
      <h1 className="heading-section">Orders</h1>
      <p className="mt-1 mb-6 text-sm text-ink-muted">Track the status of everything you&apos;ve ordered.</p>
      <Suspense fallback={<div className="h-64 animate-pulse bg-surface" aria-busy="true" />}>
        <Orders />
      </Suspense>
    </>
  );
}

async function Orders() {
  const user = await requireUser("/account/orders");
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, orderNumber: true, status: true, total: true, createdAt: true, _count: { select: { items: true } } },
  });
  if (orders.length === 0) {
    return (
      <div className="border border-line bg-canvas p-6 text-sm text-ink-muted">
        No orders yet.
        <ButtonLink href="/shop" variant="dark" className="mt-4 flex w-fit">Start shopping</ButtonLink>
      </div>
    );
  }
  return <OrderList orders={orders} />;
}
