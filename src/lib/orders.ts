import "server-only";
import { randomInt } from "node:crypto";
import { db } from "./db";
import { getCurrentUser } from "./auth";
import { hashToken } from "./tokens";

/** Unpaid online orders hold their stock for this long. */
export const PAYMENT_HOLD_MINUTES = 30;

export class CheckoutError extends Error {}

export function newOrderNumber() {
  return `BP-${randomInt(100_000, 1_000_000)}${randomInt(10, 100)}`;
}

export function codEnabled() {
  return process.env.ENABLE_COD === "true";
}

/** Returns stock for every line of a cancelled order. Caller must already have flipped the status. */
async function restock(orderId: string, tx: Pick<typeof db, "orderItem" | "variant"> = db) {
  const items = await tx.orderItem.findMany({ where: { orderId, variantId: { not: null } }, select: { variantId: true, quantity: true } });
  for (const item of items) {
    await tx.variant.update({ where: { id: item.variantId! }, data: { stock: { increment: item.quantity } } });
  }
}

/** Cancels a pending order exactly once and releases its stock. Returns false if it was no longer pending. */
export async function cancelPendingOrder(orderId: string) {
  return db.$transaction(async (tx) => {
    const flipped = await tx.order.updateMany({ where: { id: orderId, status: "PENDING_PAYMENT" }, data: { status: "CANCELLED" } });
    if (flipped.count === 0) return false;
    await tx.payment.updateMany({ where: { orderId, status: "CREATED" }, data: { status: "FAILED" } });
    await restock(orderId, tx);
    const order = await tx.order.findUnique({ where: { id: orderId }, select: { couponCode: true } });
    if (order?.couponCode) {
      await tx.coupon.updateMany({ where: { code: order.couponCode, usedCount: { gt: 0 } }, data: { usedCount: { decrement: 1 } } });
    }
    return true;
  });
}

/** Marks a pending order paid exactly once. */
export async function confirmPaidOrder(orderId: string, providerOrderId: string, providerPaymentId: string | null) {
  return db.$transaction(async (tx) => {
    const flipped = await tx.order.updateMany({ where: { id: orderId, status: "PENDING_PAYMENT" }, data: { status: "CONFIRMED" } });
    await tx.payment.updateMany({
      where: { orderId, providerOrderId },
      data: { status: "PAID", ...(providerPaymentId && { providerPaymentId }) },
    });
    return flipped.count === 1;
  });
}

/**
 * Releases stock held by abandoned online-payment orders. Before cancelling,
 * asks Razorpay whether the order was in fact paid (e.g. the buyer closed the
 * tab before returning) so a paid order is never cancelled.
 */
export async function releaseExpiredReservations(checkPaid: (providerOrderId: string) => Promise<boolean>) {
  const cutoff = new Date(Date.now() - PAYMENT_HOLD_MINUTES * 60_000);
  const stale = await db.order.findMany({
    where: { status: "PENDING_PAYMENT", createdAt: { lt: cutoff } },
    select: { id: true, payments: { select: { providerOrderId: true }, orderBy: { createdAt: "desc" }, take: 1 } },
    take: 20,
  });
  for (const order of stale) {
    const providerOrderId = order.payments[0]?.providerOrderId;
    let paid = false;
    if (providerOrderId) {
      try {
        paid = await checkPaid(providerOrderId);
      } catch {
        continue; // Payment provider unreachable: leave the order for a later sweep.
      }
    }
    if (paid && providerOrderId) await confirmPaidOrder(order.id, providerOrderId, null);
    else await cancelPendingOrder(order.id);
  }
}

/** Loads an order if the requester owns it or holds its access token. */
export async function getAuthorizedOrder(orderId: string, token: string | undefined) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order) return null;
  const user = await getCurrentUser();
  const owns = user !== null && order.userId === user.id;
  const hasToken = typeof token === "string" && token.length > 0 && hashToken(token) === order.accessTokenHash;
  return owns || hasToken ? order : null;
}
