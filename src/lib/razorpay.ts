import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function razorpayKeyId() {
  return process.env.RAZORPAY_KEY_ID ?? "";
}

/** Creates a Razorpay order for `amount` paise. Throws when the API call fails. */
export async function createRazorpayOrder(amount: number, receipt: string) {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) throw new Error("Razorpay is not configured");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount, currency: "INR", receipt }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Razorpay order creation failed (${res.status})`);
  const data = (await res.json()) as { id: string; amount: number; currency: string };
  return data;
}

/** Verifies the checkout signature Razorpay returns after a successful payment. */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** True when Razorpay reports the order as paid. */
export async function isRazorpayOrderPaid(providerOrderId: string) {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) return false;
  const res = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(providerOrderId)}`, {
    headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Razorpay order lookup failed (${res.status})`);
  const data = (await res.json()) as { status: string };
  return data.status === "paid";
}
