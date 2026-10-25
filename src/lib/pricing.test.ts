import { test } from "node:test";
import assert from "node:assert/strict";
import { computeTotals, evaluateCoupon, type CouponRule } from "./pricing";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from "./config";

const coupon = (over: Partial<CouponRule> = {}): CouponRule => ({
  code: "TEST",
  type: "PERCENT",
  value: 10,
  minSubtotal: 0,
  maxDiscount: null,
  active: true,
  startsAt: null,
  endsAt: null,
  usageLimit: null,
  usedCount: 0,
  ...over,
});

test("charges shipping below the free threshold", () => {
  const t = computeTotals([{ unitPrice: 50_000, quantity: 2 }]);
  assert.deepEqual(t, { subtotal: 100_000, discount: 0, shipping: STANDARD_SHIPPING_FEE, total: 100_000 + STANDARD_SHIPPING_FEE });
});

test("ships free at exactly the threshold", () => {
  const t = computeTotals([{ unitPrice: FREE_SHIPPING_THRESHOLD, quantity: 1 }]);
  assert.equal(t.shipping, 0);
  assert.equal(t.total, FREE_SHIPPING_THRESHOLD);
});

test("an empty bag costs nothing", () => {
  assert.deepEqual(computeTotals([]), { subtotal: 0, discount: 0, shipping: 0, total: 0 });
});

test("discount that drops below the threshold brings shipping back", () => {
  const t = computeTotals([{ unitPrice: FREE_SHIPPING_THRESHOLD, quantity: 1 }], 1_000);
  assert.equal(t.shipping, STANDARD_SHIPPING_FEE);
  assert.equal(t.total, FREE_SHIPPING_THRESHOLD - 1_000 + STANDARD_SHIPPING_FEE);
});

test("discount never exceeds the subtotal", () => {
  const t = computeTotals([{ unitPrice: 10_000, quantity: 1 }], 99_999);
  assert.equal(t.discount, 10_000);
  assert.equal(t.total, 0);
});

test("percent coupon is floored and capped", () => {
  // 10% of ₹2,598 is ₹259.80 → ₹259.
  assert.deepEqual(evaluateCoupon(coupon({ value: 10 }), 259_800), { ok: true, discount: 25_900 });
  assert.deepEqual(evaluateCoupon(coupon({ value: 50, maxDiscount: 20_000 }), 100_000), { ok: true, discount: 20_000 });
});

test("fixed coupon cannot exceed subtotal", () => {
  assert.deepEqual(evaluateCoupon(coupon({ type: "FIXED", value: 50_000 }), 30_000), { ok: true, discount: 30_000 });
});

test("coupon rejections", () => {
  const now = new Date("2026-06-01T00:00:00Z");
  assert.equal(evaluateCoupon(coupon({ active: false }), 1, now).ok, false);
  assert.equal(evaluateCoupon(coupon({ startsAt: new Date("2026-07-01") }), 1, now).ok, false);
  assert.equal(evaluateCoupon(coupon({ endsAt: new Date("2026-05-01") }), 1, now).ok, false);
  assert.equal(evaluateCoupon(coupon({ usageLimit: 5, usedCount: 5 }), 1, now).ok, false);
  assert.equal(evaluateCoupon(coupon({ minSubtotal: 200_000 }), 199_999, now).ok, false);
});
