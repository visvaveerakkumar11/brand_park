import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";
import { getCurrentUser } from "./auth";
import { MAX_LINE_QUANTITY } from "./config";

const CART_COOKIE = "bp_cart";
const WISHLIST_COOKIE = "bp_wishlist";
const GUEST_COOKIE_DAYS = 60;

const guestCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: GUEST_COOKIE_DAYS * 86_400,
};

// ---------------------------------------------------------------- cart

/** Resolves the current cart id without creating anything. */
async function findCartId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (user) {
    const cart = await db.cart.findUnique({ where: { userId: user.id }, select: { id: true } });
    return cart?.id ?? null;
  }
  const id = (await cookies()).get(CART_COOKIE)?.value;
  if (!id) return null;
  // Only accept guest carts; a user-owned cart id in a cookie must not grant access.
  const cart = await db.cart.findFirst({ where: { id, userId: null }, select: { id: true } });
  return cart?.id ?? null;
}

/** Returns the current cart id, creating a cart (and guest cookie) when needed. Server Actions only. */
export async function ensureCartId(): Promise<string> {
  const existing = await findCartId();
  if (existing) return existing;
  const user = await getCurrentUser();
  if (user) {
    const cart = await db.cart.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } });
    return cart.id;
  }
  const cart = await db.cart.create({ data: { id: randomUUID() } });
  (await cookies()).set(CART_COOKIE, cart.id, guestCookie);
  return cart.id;
}

export type CartLine = {
  id: string;
  variantId: string;
  quantity: number;
  stock: number;
  size: string;
  colorName: string;
  unitPrice: number;
  compareAtPrice: number | null;
  product: { id: string; slug: string; name: string; image: { url: string; alt: string } };
};

export async function getCart() {
  const cartId = await findCartId();
  if (!cartId) return { id: null, lines: [] as CartLine[] };
  const items = await db.cartItem.findMany({
    where: { cartId, variant: { product: { active: true } } },
    orderBy: { id: "asc" },
    select: {
      id: true,
      quantity: true,
      variant: {
        select: {
          id: true,
          stock: true,
          size: true,
          colorName: true,
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              price: true,
              compareAtPrice: true,
              images: { select: { url: true, alt: true }, orderBy: { sortOrder: "asc" }, take: 1 },
            },
          },
        },
      },
    },
  });
  const lines: CartLine[] = items.map((i) => ({
    id: i.id,
    variantId: i.variant.id,
    quantity: i.quantity,
    stock: i.variant.stock,
    size: i.variant.size,
    colorName: i.variant.colorName,
    unitPrice: i.variant.product.price,
    compareAtPrice: i.variant.product.compareAtPrice,
    product: {
      id: i.variant.product.id,
      slug: i.variant.product.slug,
      name: i.variant.product.name,
      image: i.variant.product.images[0] ?? { url: "/images/brand/story.jpg", alt: i.variant.product.name },
    },
  }));
  return { id: cartId, lines };
}

export async function getCartCount() {
  const cartId = await findCartId();
  if (!cartId) return 0;
  const agg = await db.cartItem.aggregate({ where: { cartId }, _sum: { quantity: true } });
  return agg._sum.quantity ?? 0;
}

// ------------------------------------------------------------ wishlist

async function findWishlistId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (user) {
    const w = await db.wishlist.findUnique({ where: { userId: user.id }, select: { id: true } });
    return w?.id ?? null;
  }
  const id = (await cookies()).get(WISHLIST_COOKIE)?.value;
  if (!id) return null;
  const w = await db.wishlist.findFirst({ where: { id, userId: null }, select: { id: true } });
  return w?.id ?? null;
}

export async function ensureWishlistId(): Promise<string> {
  const existing = await findWishlistId();
  if (existing) return existing;
  const user = await getCurrentUser();
  if (user) {
    const w = await db.wishlist.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } });
    return w.id;
  }
  const w = await db.wishlist.create({ data: { id: randomUUID() } });
  (await cookies()).set(WISHLIST_COOKIE, w.id, guestCookie);
  return w.id;
}

export async function getWishlistProductIds(): Promise<string[]> {
  const id = await findWishlistId();
  if (!id) return [];
  const items = await db.wishlistItem.findMany({ where: { wishlistId: id }, select: { productId: true } });
  return items.map((i) => i.productId);
}

// --------------------------------------------------------------- merge

/**
 * After sign-in, fold the guest cart and wishlist into the user's own and
 * drop the guest cookies. Quantities are summed and capped.
 */
export async function adoptGuestData(userId: string) {
  const store = await cookies();
  const guestCartId = store.get(CART_COOKIE)?.value;
  const guestWishlistId = store.get(WISHLIST_COOKIE)?.value;

  if (guestCartId) {
    const guest = await db.cart.findFirst({ where: { id: guestCartId, userId: null }, include: { items: true } });
    if (guest) {
      await db.$transaction(async (tx) => {
        const cart = await tx.cart.upsert({ where: { userId }, update: {}, create: { userId } });
        for (const item of guest.items) {
          const current = await tx.cartItem.findUnique({
            where: { cartId_variantId: { cartId: cart.id, variantId: item.variantId } },
          });
          const quantity = Math.min((current?.quantity ?? 0) + item.quantity, MAX_LINE_QUANTITY);
          await tx.cartItem.upsert({
            where: { cartId_variantId: { cartId: cart.id, variantId: item.variantId } },
            update: { quantity },
            create: { cartId: cart.id, variantId: item.variantId, quantity },
          });
        }
        await tx.cart.delete({ where: { id: guest.id } });
      });
    }
    store.delete(CART_COOKIE);
  }

  if (guestWishlistId) {
    const guest = await db.wishlist.findFirst({ where: { id: guestWishlistId, userId: null }, include: { items: true } });
    if (guest) {
      await db.$transaction(async (tx) => {
        const w = await tx.wishlist.upsert({ where: { userId }, update: {}, create: { userId } });
        if (guest.items.length) {
          await tx.wishlistItem.createMany({
            data: guest.items.map((i) => ({ wishlistId: w.id, productId: i.productId })),
            skipDuplicates: true,
          });
        }
        await tx.wishlist.delete({ where: { id: guest.id } });
      });
    }
    store.delete(WISHLIST_COOKIE);
  }
}
