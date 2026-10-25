import Image from "next/image";
import Link from "next/link";
import type { getAuthorizedOrder } from "@/lib/orders";
import { formatPrice } from "@/lib/money";
import { SummaryRows } from "@/components/cart/order-summary";

type Order = NonNullable<Awaited<ReturnType<typeof getAuthorizedOrder>>>;

const STEPS = [
  { status: "CONFIRMED", label: "Order confirmed" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "DELIVERED", label: "Delivered" },
] as const;

export const STATUS_LABEL: Record<Order["status"], string> = {
  PENDING_PAYMENT: "Awaiting payment",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const dateFmt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

export function OrderDetails({ order }: { order: Order }) {
  const reached = STEPS.findIndex((s) => s.status === order.status);
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex flex-col gap-8">
        {order.status === "CANCELLED" ? (
          <p className="border border-line bg-canvas px-4 py-3 text-sm text-ink-muted">This order was cancelled and any reserved items were released.</p>
        ) : order.status === "PENDING_PAYMENT" ? (
          <p className="border border-line bg-canvas px-4 py-3 text-sm text-ink-muted">We&apos;re waiting for your payment to be confirmed.</p>
        ) : (
          <ol className="grid grid-cols-3 gap-2" aria-label="Order progress">
            {STEPS.map((s, i) => (
              <li key={s.status} className="flex flex-col gap-2">
                <span className={`h-1 rounded-full ${i <= reached ? "bg-forest" : "bg-line"}`} />
                <span className={`text-[11px] font-medium tracking-[0.05em] uppercase ${i <= reached ? "text-forest" : "text-ink-subtle"}`}>
                  {s.label}
                  {i <= reached && <span className="sr-only"> (complete)</span>}
                </span>
              </li>
            ))}
          </ol>
        )}

        <section aria-label="Items">
          <h2 className="label-caps mb-4">Items ({order.items.reduce((n, i) => n + i.quantity, 0)})</h2>
          <ul className="divide-y divide-line border-y border-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-4">
                <div className="relative h-20 w-15 shrink-0 overflow-hidden border border-line bg-stone">
                  <Image src={item.imageUrl} alt="" fill sizes="60px" className="object-cover" />
                </div>
                <div className="flex-1 text-sm">
                  <Link href={`/product/${item.productSlug}`} className="font-medium hover:underline">{item.productName}</Link>
                  <p className="text-xs text-ink-muted">
                    {item.colorName} · Size {item.size} · Qty {item.quantity} · {formatPrice(item.unitPrice)} each
                  </p>
                </div>
                <p className="text-sm">{formatPrice(item.unitPrice * item.quantity)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="flex flex-col gap-4">
        <div className="border border-line p-6">
          <h2 className="label-caps mb-4">Payment summary</h2>
          <SummaryRows subtotal={order.subtotal} discount={order.discount} shipping={order.shipping} total={order.total} couponCode={order.couponCode} />
          <p className="mt-4 text-xs text-ink-muted">
            {order.paymentMethod === "COD" ? "Cash on delivery" : "Paid online via Razorpay"}
            {order.paymentMethod === "RAZORPAY" && order.status === "PENDING_PAYMENT" && " (pending)"}
          </p>
        </div>
        <div className="border border-line p-6 text-sm">
          <h2 className="label-caps mb-3">Shipping to</h2>
          <address className="leading-6 text-ink-muted not-italic">
            <span className="text-ink">{order.shipFullName}</span>
            <br />
            {order.shipLine1}
            {order.shipLine2 && <>, {order.shipLine2}</>}
            <br />
            {order.shipCity}, {order.shipState} {order.shipPostalCode}
            <br />
            {order.shipPhone}
          </address>
          <p className="mt-3 text-xs text-ink-muted">Contact email: {order.email}</p>
        </div>
        <p className="text-xs text-ink-muted">Placed {dateFmt.format(order.createdAt)}</p>
      </aside>
    </div>
  );
}
