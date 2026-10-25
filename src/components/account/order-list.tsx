import Link from "next/link";
import { formatPrice } from "@/lib/money";
import { STATUS_LABEL } from "@/components/orders/order-details";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: keyof typeof STATUS_LABEL;
  total: number;
  createdAt: Date;
  _count: { items: number };
};

const dateFmt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" });

export function OrderList({ orders }: { orders: OrderRow[] }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={`/order-confirmation/${o.id}`} className="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-canvas">
            <span>
              <span className="block text-sm font-medium">{o.orderNumber}</span>
              <span className="text-xs text-ink-muted">
                {dateFmt.format(o.createdAt)} · {o._count.items} {o._count.items === 1 ? "line" : "lines"}
              </span>
            </span>
            <span className="flex items-center gap-4">
              <span className={`text-[11px] font-medium tracking-[0.05em] uppercase ${o.status === "CANCELLED" ? "text-ink-subtle" : "text-forest"}`}>
                {STATUS_LABEL[o.status]}
              </span>
              <span className="text-sm font-medium">{formatPrice(o.total)}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
