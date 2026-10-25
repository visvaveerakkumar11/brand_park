import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from "./config";

export type PricedLine = { unitPrice: number; quantity: number };

export type CouponRule = {
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minSubtotal: number;
  maxDiscount: number | null;
  active: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  usageLimit: number | null;
  usedCount: number;
};

export type CouponResult = { ok: true; discount: number } | { ok: false; reason: string };

export function subtotalOf(lines: PricedLine[]) {
  return lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
}

export function evaluateCoupon(coupon: CouponRule, subtotal: number, now = new Date()): CouponResult {
  if (!coupon.active) return { ok: false, reason: "This code is no longer active." };
  if (coupon.startsAt && now < coupon.startsAt) return { ok: false, reason: "This code isn't active yet." };
  if (coupon.endsAt && now > coupon.endsAt) return { ok: false, reason: "This code has expired." };
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, reason: "This code has reached its usage limit." };
  }
  if (subtotal < coupon.minSubtotal) {
    return { ok: false, reason: "Your bag doesn't meet the minimum for this code." };
  }
  // Percent discounts are floored to whole rupees so totals never carry paise.
  let discount = coupon.type === "PERCENT" ? Math.floor((subtotal * coupon.value) / 100 / 100) * 100 : coupon.value;
  if (coupon.maxDiscount !== null) discount = Math.min(discount, coupon.maxDiscount);
  return { ok: true, discount: Math.min(discount, subtotal) };
}

/** Shipping is free once the merchandise value (after discount) reaches the threshold. */
export function shippingFor(discountedSubtotal: number) {
  if (discountedSubtotal === 0) return 0;
  return discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}

export function computeTotals(lines: PricedLine[], discount = 0) {
  const subtotal = subtotalOf(lines);
  const appliedDiscount = Math.min(Math.max(discount, 0), subtotal);
  const shipping = shippingFor(subtotal - appliedDiscount);
  return { subtotal, discount: appliedDiscount, shipping, total: subtotal - appliedDiscount + shipping };
}
