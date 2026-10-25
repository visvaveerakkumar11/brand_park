import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAuthorizedOrder } from "@/lib/orders";
import { ButtonLink } from "@/components/ui/button";
import { OrderDetails, STATUS_LABEL } from "@/components/orders/order-details";

export const metadata: Metadata = { title: "Order Confirmation", robots: { index: false } };

export default function OrderConfirmationPage({ params, searchParams }: PageProps<"/order-confirmation/[orderId]">) {
  return (
    <div className="container-page py-10">
      <Suspense fallback={<div className="h-96 animate-pulse bg-surface" aria-busy="true" />}>
        <Confirmation params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Confirmation({
  params,
  searchParams,
}: {
  params: PageProps<"/order-confirmation/[orderId]">["params"];
  searchParams: PageProps<"/order-confirmation/[orderId]">["searchParams"];
}) {
  const [{ orderId }, sp] = await Promise.all([params, searchParams]);
  const order = await getAuthorizedOrder(orderId, typeof sp.token === "string" ? sp.token : undefined);
  // Unauthorised and missing orders look the same.
  if (!order) notFound();

  const firstName = order.shipFullName.split(" ")[0];
  const placed = order.status !== "CANCELLED" && order.status !== "PENDING_PAYMENT";
  return (
    <>
      <div className="mb-10 flex flex-col gap-4 border border-line bg-canvas p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="eyebrow">Order {order.orderNumber} · {STATUS_LABEL[order.status]}</p>
          <h1 className="mt-1 text-[26px] leading-9 font-medium tracking-[-0.02em] sm:text-[32px]">
            {placed ? `Thank you for your order, ${firstName}.` : `Order ${order.orderNumber}`}
          </h1>
          {placed && <p className="mt-1 text-sm text-ink-muted">Keep this page or your order number for reference.</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {order.userId && <ButtonLink href="/account/orders" variant="outline">View my orders</ButtonLink>}
          <ButtonLink href="/shop" variant="forest">Continue shopping</ButtonLink>
        </div>
      </div>
      <OrderDetails order={order} />
    </>
  );
}
