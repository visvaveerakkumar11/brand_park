"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { ensureCartId, ensureWishlistId, getCart } from "@/lib/cart";
import { MAX_LINE_QUANTITY } from "@/lib/config";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const addSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY),
});

export async function addToCart(input: { variantId: string; quantity: number }): Promise<ActionResult> {
  const parsed = addSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please choose a size and quantity." };
  const { variantId, quantity } = parsed.data;

  const variant = await db.variant.findFirst({
    where: { id: variantId, product: { active: true } },
    select: { stock: true },
  });
  if (!variant) return { ok: false, error: "This item is no longer available." };
  if (variant.stock <= 0) return { ok: false, error: "This size is out of stock." };

  const cartId = await ensureCartId();
  const existing = await db.cartItem.findUnique({ where: { cartId_variantId: { cartId, variantId } } });
  const wanted = (existing?.quantity ?? 0) + quantity;
  const limit = Math.min(variant.stock, MAX_LINE_QUANTITY);
  if (wanted > limit) {
    const room = limit - (existing?.quantity ?? 0);
    return {
      ok: false,
      error: room > 0 ? `Only ${room} more can be added for this size.` : "You already have the maximum available in your bag.",
    };
  }

  await db.cartItem.upsert({
    where: { cartId_variantId: { cartId, variantId } },
    update: { quantity: wanted },
    create: { cartId, variantId, quantity },
  });
  refresh();
  return { ok: true, message: "Added to your bag." };
}

const updateSchema = z.object({
  lineId: z.string().min(1),
  quantity: z.number().int().min(0).max(MAX_LINE_QUANTITY),
});

export async function updateCartLine(input: { lineId: string; quantity: number }): Promise<ActionResult> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid quantity." };
  const { lineId, quantity } = parsed.data;

  const { id: cartId, lines } = await getCart();
  const line = lines.find((l) => l.id === lineId);
  if (!cartId || !line) return { ok: false, error: "That item is no longer in your bag." };

  if (quantity === 0) {
    await db.cartItem.delete({ where: { id: lineId } });
  } else {
    if (quantity > line.stock) return { ok: false, error: `Only ${line.stock} available in this size.` };
    await db.cartItem.update({ where: { id: lineId }, data: { quantity } });
  }
  refresh();
  return { ok: true };
}

export async function removeCartLine(lineId: string): Promise<ActionResult> {
  return updateCartLine({ lineId, quantity: 0 });
}

export async function toggleWishlist(productId: string): Promise<ActionResult & { wishlisted?: boolean }> {
  if (typeof productId !== "string" || !productId) return { ok: false, error: "Unknown product." };
  const product = await db.product.findFirst({ where: { id: productId, active: true }, select: { id: true } });
  if (!product) return { ok: false, error: "This item is no longer available." };

  const wishlistId = await ensureWishlistId();
  const key = { wishlistId_productId: { wishlistId, productId } };
  const existing = await db.wishlistItem.findUnique({ where: key });
  if (existing) {
    await db.wishlistItem.delete({ where: key });
  } else {
    await db.wishlistItem.create({ data: { wishlistId, productId } });
  }
  refresh();
  return { ok: true, wishlisted: !existing };
}
