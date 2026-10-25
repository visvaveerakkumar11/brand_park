import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { verifyPaymentSignature } from "./razorpay";

test("accepts only Razorpay's HMAC of order_id|payment_id", () => {
  process.env.RAZORPAY_KEY_SECRET = "test_secret";
  const good = createHmac("sha256", "test_secret").update("order_1|pay_1").digest("hex");
  assert.equal(verifyPaymentSignature("order_1", "pay_1", good), true);
  assert.equal(verifyPaymentSignature("order_1", "pay_2", good), false, "different payment");
  assert.equal(verifyPaymentSignature("order_2", "pay_1", good), false, "different order");
  const tampered = good.slice(0, -1) + (good.endsWith("0") ? "1" : "0");
  assert.equal(verifyPaymentSignature("order_1", "pay_1", tampered), false, "tampered signature");
  assert.equal(verifyPaymentSignature("order_1", "pay_1", "short"), false, "length mismatch");
});

test("rejects every signature when no secret is configured", () => {
  delete process.env.RAZORPAY_KEY_SECRET;
  assert.equal(verifyPaymentSignature("order_1", "pay_1", "anything"), false);
});
