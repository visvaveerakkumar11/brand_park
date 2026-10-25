import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";
import { formatPrice } from "@/lib/money";

export function SummaryRows({
  subtotal,
  discount,
  shipping,
  total,
  couponCode,
}: {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string | null;
}) {
  return (
    <dl className="space-y-3 text-sm">
      <div className="flex justify-between">
        <dt className="text-ink-muted">Subtotal</dt>
        <dd>{formatPrice(subtotal)}</dd>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-forest">
          <dt>Discount{couponCode && ` (${couponCode})`}</dt>
          <dd>−{formatPrice(discount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-ink-muted">Delivery</dt>
        <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
      </div>
      <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
        <dt>Total</dt>
        <dd>{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}

export function FreeShippingMeter({ merchandise }: { merchandise: number }) {
  const remaining = FREE_SHIPPING_THRESHOLD - merchandise;
  const pct = Math.min(100, Math.round((merchandise / FREE_SHIPPING_THRESHOLD) * 100));
  return (
    <div className="border border-line bg-canvas p-4">
      <p className="text-xs font-medium tracking-[0.05em] text-ink uppercase">
        {remaining > 0 ? <>You&apos;re {formatPrice(remaining)} away from free delivery</> : "You've unlocked free delivery"}
      </p>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free delivery">
        <div className="h-full bg-forest" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
