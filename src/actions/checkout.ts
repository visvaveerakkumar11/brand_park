"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { CATALOG_TAG } from "@/lib/catalog";
import { computeTotals, evaluateCoupon, subtotalOf } from "@/lib/pricing";
import { hashToken, newToken } from "@/lib/tokens";
import { addressSchema, emailSchema, fieldErrors, formValues } from "@/lib/validation";
import {
  cancelPendingOrder,
  CheckoutError,
  codEnabled,
  confirmPaidOrder,
  getAuthorizedOrder,
  newOrderNumber,
  releaseExpiredReservations,
} from "@/lib/orders";
import {
  createRazorpayOrder,
  isRazorpayConfigured,
  isRazorpayOrderPaid,
  razorpayKeyId,
  verifyPaymentSignature,
} from "@/lib/razorpay";

// ------------------------------------------------------------- coupons

export type CouponPreview =
  | { ok: true; code: string; discount: number; shipping: number; total: number }
  | { ok: false; error: string };

/** Validates a coupon against the visitor's current bag. Totals are recomputed again when the order is placed. */
export async function previewCoupon(rawCode: string): Promise<CouponPreview> {
  const code = String(rawCode ?? "").trim().toUpperCase().slice(0, 40);
  if (!code) return { ok: false, error: "Enter a code." };
  const { lines } = await getCart();
  if (lines.length === 0) return { ok: false, error: "Your bag is empty." };
  const coupon = await db.coupon.findUnique({ where: { code } });
  if (!coupon) return { ok: false, error: "That code isn't valid." };
  const result = evaluateCoupon(coupon, subtotalOf(lines));
  if (!result.ok) return { ok: false, error: result.reason };
  const totals = computeTotals(lines, result.discount);
  return { ok: true, code, discount: totals.discount, shipping: totals.shipping, total: totals.total };
}

// --------------------------------------------------------- place order

const checkoutSchema = addressSchema.extend({
  email: emailSchema,
  paymentMethod: z.enum(["RAZORPAY", "COD"], { error: "Choose a payment method." }),
  couponCode: z.string().trim().toUpperCase().max(40).optional().transform((v) => v || undefined),
  saveAddress: z.literal("on").optional(),
});

export type PlaceOrderResult =
  | { ok: false; error: string; fields?: Record<string, string> }
  | { ok: true; kind: "confirmed"; redirectTo: string }
  | {
      ok: true;
      kind: "pay";
      orderId: string;
      token: string;
      razorpay: { keyId: string; orderId: string; amount: number; orderNumber: string; name: string; email: string; phone: string };
    };

export async function placeOrder(formData: FormData): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(formValues(formData));
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) };
  const input = parsed.data;

  if (input.paymentMethod === "RAZORPAY" && !isRazorpayConfigured()) {
    return { ok: false, error: "Online payment isn't available right now." };
  }
  if (input.paymentMethod === "COD" && !codEnabled()) {
    return { ok: false, error: "Cash on delivery isn't available." };
  }

  // Free stock held by abandoned online payments before checking availability.
  await releaseExpiredReservations(isRazorpayOrderPaid);

  const user = await getCurrentUser();
  const { id: cartId, lines } = await getCart();
  if (!cartId || lines.length === 0) return { ok: false, error: "Your bag is empty." };

  const token = newToken();
  let order: { id: string; orderNumber: string; total: number };
  try {
    order = await db.$transaction(async (tx) => {
      // Reserve stock line by line; a conditional decrement fails if someone else got there first.
      for (const line of lines) {
        const reserved = await tx.variant.updateMany({
          where: { id: line.variantId, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (reserved.count === 0) {
          throw new CheckoutError(`${line.product.name} (${line.size}) no longer has ${line.quantity} in stock. Please update your bag.`);
        }
      }

      let discount = 0;
      let couponCode: string | null = null;
      if (input.couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: input.couponCode } });
        const result = coupon ? evaluateCoupon(coupon, subtotalOf(lines)) : { ok: false as const, reason: "That code isn't valid." };
        if (!result.ok) throw new CheckoutError(result.reason);
        if (coupon!.usageLimit !== null) {
          const claimed = await tx.coupon.updateMany({
            where: { id: coupon!.id, usedCount: { lt: coupon!.usageLimit } },
            data: { usedCount: { increment: 1 } },
          });
          if (claimed.count === 0) throw new CheckoutError("This code has reached its usage limit.");
        } else {
          await tx.coupon.update({ where: { id: coupon!.id }, data: { usedCount: { increment: 1 } } });
        }
        discount = result.discount;
        couponCode = coupon!.code;
      }

      const totals = computeTotals(lines, discount);
      const created = await tx.order.create({
        data: {
          orderNumber: newOrderNumber(),
          userId: user?.id ?? null,
          email: input.email,
          status: input.paymentMethod === "COD" ? "CONFIRMED" : "PENDING_PAYMENT",
          paymentMethod: input.paymentMethod,
          shipFullName: input.fullName,
          shipPhone: input.phone,
          shipLine1: input.line1,
          shipLine2: input.line2 ?? null,
          shipCity: input.city,
          shipState: input.state,
          shipPostalCode: input.postalCode,
          ...totals,
          couponCode,
          accessTokenHash: hashToken(token),
          items: {
            create: lines.map((l) => ({
              variantId: l.variantId,
              productSlug: l.product.slug,
              productName: l.product.name,
              imageUrl: l.product.image.url,
              size: l.size,
              colorName: l.colorName,
              unitPrice: l.unitPrice,
              quantity: l.quantity,
            })),
          },
        },
        select: { id: true, orderNumber: true, total: true },
      });

      if (user && input.saveAddress) {
        const hasDefault = await tx.address.count({ where: { userId: user.id, isDefault: true } });
        await tx.address.create({
          data: {
            userId: user.id,
            fullName: input.fullName,
            phone: input.phone,
            line1: input.line1,
            line2: input.line2 ?? null,
            city: input.city,
            state: input.state,
            postalCode: input.postalCode,
            isDefault: hasDefault === 0,
          },
        });
      }

      // Cash orders are final now; online orders keep the bag until payment succeeds.
      if (input.paymentMethod === "COD") await tx.cartItem.deleteMany({ where: { cartId } });
      return created;
    });
  } catch (e) {
    if (e instanceof CheckoutError) return { ok: false, error: e.message };
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "Something went wrong placing your order. Please try again." };
    }
    throw e;
  }

  updateTag(CATALOG_TAG);

  if (input.paymentMethod === "COD") {
    return { ok: true, kind: "confirmed", redirectTo: `/order-confirmation/${order.id}?token=${token}` };
  }

  try {
    const rp = await createRazorpayOrder(order.total, order.orderNumber);
    await db.payment.create({ data: { orderId: order.id, provider: "razorpay", providerOrderId: rp.id, amount: order.total } });
    return {
      ok: true,
      kind: "pay",
      orderId: order.id,
      token,
      razorpay: {
        keyId: razorpayKeyId(),
        orderId: rp.id,
        amount: order.total,
        orderNumber: order.orderNumber,
        name: input.fullName,
        email: input.email,
        phone: input.phone,
      },
    };
  } catch (e) {
    console.error("Razorpay order creation failed", e);
    await cancelPendingOrder(order.id);
    updateTag(CATALOG_TAG);
    return { ok: false, error: "We couldn't start the payment. You have not been charged — please try again." };
  }
}

// ------------------------------------------------------ payment result

const verifySchema = z.object({
  orderId: z.string().min(1),
  token: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function confirmPayment(input: z.input<typeof verifySchema>): Promise<{ ok: true; redirectTo: string } | { ok: false; error: string }> {
  const parsed = verifySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid payment response." };
  const p = parsed.data;

  const order = await getAuthorizedOrder(p.orderId, p.token);
  const payment = order?.payments[0];
  if (!order || !payment || payment.providerOrderId !== p.razorpay_order_id) return { ok: false, error: "Order not found." };
  if (!verifyPaymentSignature(p.razorpay_order_id, p.razorpay_payment_id, p.razorpay_signature)) {
    return { ok: false, error: "We couldn't verify this payment. If you were charged, please contact us with your order number." };
  }

  if (order.status === "PENDING_PAYMENT") {
    await confirmPaidOrder(order.id, p.razorpay_order_id, p.razorpay_payment_id);
  } else if (order.status === "CANCELLED") {
    // Payment arrived after the hold expired; record it so the team can resolve it.
    await db.payment.update({ where: { id: payment.id }, data: { status: "PAID", providerPaymentId: p.razorpay_payment_id } });
    console.error(`Payment ${p.razorpay_payment_id} received for cancelled order ${order.orderNumber}`);
    return { ok: false, error: `Your payment was received after order ${order.orderNumber} expired. Please contact us — we'll resolve it.` };
  }

  // Remove the purchased lines from the visitor's bag.
  const { id: cartId } = await getCart();
  if (cartId) {
    const variantIds = order.items.map((i) => i.variantId).filter((v): v is string => v !== null);
    await db.cartItem.deleteMany({ where: { cartId, variantId: { in: variantIds } } });
  }
  return { ok: true, redirectTo: `/order-confirmation/${order.id}?token=${p.token}` };
}

/** Called when the buyer dismisses the payment window: release the reserved stock. */
export async function abandonPayment(input: { orderId: string; token: string }) {
  const order = await getAuthorizedOrder(String(input?.orderId ?? ""), String(input?.token ?? ""));
  if (!order || order.status !== "PENDING_PAYMENT") return { ok: false as const };
  const providerOrderId = order.payments[0]?.providerOrderId;
  // Never cancel an order Razorpay considers paid.
  if (providerOrderId && (await isRazorpayOrderPaid(providerOrderId).catch(() => true))) return { ok: false as const };
  await cancelPendingOrder(order.id);
  updateTag(CATALOG_TAG);
  return { ok: true as const };
}
