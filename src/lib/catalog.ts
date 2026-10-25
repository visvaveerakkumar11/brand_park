import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";
import { PAGE_SIZE } from "./config";
import { PRICE_BANDS, type ListingFilters, type ListingScope, type SortKey } from "./listing-options";

export { PRICE_BANDS, SORTS, type ListingFilters, type ListingScope, type PriceBand, type SortKey } from "./listing-options";

export const CATALOG_TAG = "catalog";

const cardSelect = {
  id: true,
  slug: true,
  name: true,
  price: true,
  compareAtPrice: true,
  isNew: true,
  isBestSeller: true,
  images: { select: { url: true, alt: true }, orderBy: { sortOrder: "asc" }, take: 1 },
  variants: {
    select: { id: true, size: true, colorName: true, colorHex: true, stock: true },
    orderBy: { sizeOrder: "asc" },
  },
} satisfies Prisma.ProductSelect;

type CardRow = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  isNew: boolean;
  isBestSeller: boolean;
  image: { url: string; alt: string };
  colors: { name: string; hex: string }[];
  totalStock: number;
  /** Sizes for quick add; only populated for single-colour products. */
  sizes: { variantId: string; size: string; stock: number }[];
};

function toCard(p: CardRow): ProductCardData {
  const colors = new Map<string, string>();
  for (const v of p.variants) colors.set(v.colorName, v.colorHex);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    isNew: p.isNew,
    isBestSeller: p.isBestSeller,
    image: p.images[0] ?? { url: "/images/brand/story.jpg", alt: p.name },
    colors: [...colors].map(([name, hex]) => ({ name, hex })),
    totalStock: p.variants.reduce((n, v) => n + v.stock, 0),
    sizes: colors.size === 1 ? p.variants.map((v) => ({ variantId: v.id, size: v.size, stock: v.stock })) : [],
  };
}

function scopeWhere(scope: ListingScope): Prisma.ProductWhereInput {
  const q = scope.q?.trim();
  return {
    active: true,
    ...(scope.category && { category: { slug: scope.category } }),
    ...(scope.collection && { collections: { some: { slug: scope.collection } } }),
    ...(scope.isNew && { isNew: true }),
    ...(scope.bestSeller && { isBestSeller: true }),
    ...(scope.sale && { compareAtPrice: { not: null } }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { material: { contains: q, mode: "insensitive" } },
        { category: { name: { contains: q, mode: "insensitive" } } },
      ],
    }),
  };
}

function orderBy(sort: SortKey): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ createdAt: "desc" }];
    case "price-asc":
      return [{ price: "asc" }, { createdAt: "desc" }];
    case "price-desc":
      return [{ price: "desc" }, { createdAt: "desc" }];
    default:
      return [{ isBestSeller: "desc" }, { isNew: "desc" }, { createdAt: "desc" }];
  }
}

export async function getListing(scope: ListingScope, filters: ListingFilters) {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  const base = scopeWhere(scope);
  const band = filters.price ? PRICE_BANDS[filters.price] : undefined;
  // A size filter only matches sizes that are actually in stock.
  const where: Prisma.ProductWhereInput = {
    AND: [
      base,
      filters.sizes.length ? { variants: { some: { size: { in: filters.sizes }, stock: { gt: 0 } } } } : {},
      filters.colors.length ? { variants: { some: { colorName: { in: filters.colors } } } } : {},
      filters.fits.length ? { fit: { in: filters.fits } } : {},
      band ? { price: { gte: band.min, ...(band.max !== undefined && { lte: band.max }) } } : {},
    ],
  };

  const [total, rows, facetVariants, facetFits] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      select: cardSelect,
      orderBy: orderBy(filters.sort),
      skip: (filters.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    // Facets describe the whole scope so options don't vanish as filters are applied.
    db.variant.findMany({
      where: { product: base },
      select: { size: true, sizeOrder: true, colorName: true, colorHex: true },
      distinct: ["size", "colorName"],
    }),
    db.product.findMany({ where: base, select: { fit: true }, distinct: ["fit"], orderBy: { fit: "asc" } }),
  ]);

  const sizes = new Map<string, number>();
  const colors = new Map<string, string>();
  for (const v of facetVariants) {
    sizes.set(v.size, v.sizeOrder);
    colors.set(v.colorName, v.colorHex);
  }
  const letterSizes = ["S", "M", "L", "XL", "XXL"];
  const sortedSizes = [...sizes.keys()].sort((a, b) => {
    const la = letterSizes.indexOf(a);
    const lb = letterSizes.indexOf(b);
    if (la !== -1 || lb !== -1) return (la === -1 ? 99 : la) - (lb === -1 ? 99 : lb);
    return Number(a) - Number(b);
  });

  return {
    products: rows.map(toCard),
    total,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    facets: {
      sizes: sortedSizes,
      colors: [...colors].map(([name, hex]) => ({ name, hex })).sort((a, b) => a.name.localeCompare(b.name)),
      fits: facetFits.map((p) => p.fit),
    },
  };
}

export async function getProductCards(scope: ListingScope, take: number, sort: SortKey = "featured") {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const rows = await db.product.findMany({ where: scopeWhere(scope), select: cardSelect, orderBy: orderBy(sort), take });
  return rows.map(toCard);
}

export async function getCategories() {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  return db.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      slug: true,
      name: true,
      description: true,
      image: true,
      _count: { select: { products: { where: { active: true } } } },
    },
  });
}

export async function getCategory(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  return db.category.findUnique({ where: { slug }, select: { slug: true, name: true, description: true } });
}

export async function getCollections() {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  return db.collection.findMany({
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true, description: true, image: true },
  });
}

export async function getProduct(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const product = await db.product.findFirst({
    where: { slug, active: true },
    include: {
      category: { select: { slug: true, name: true } },
      images: { orderBy: { sortOrder: "asc" }, select: { url: true, alt: true } },
      variants: {
        orderBy: { sizeOrder: "asc" },
        select: { id: true, size: true, colorName: true, colorHex: true, stock: true },
      },
    },
  });
  if (!product) return null;
  const related = await db.product.findMany({
    where: { active: true, categoryId: product.categoryId, id: { not: product.id } },
    select: cardSelect,
    orderBy: orderBy("featured"),
    take: 4,
  });
  return { product, related: related.map(toCard) };
}

export async function getAllProductSlugs() {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  return db.product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } });
}

/** Card data for specific products (e.g. a visitor's wishlist). Not cached: the id set is per visitor. */
export async function getProductCardsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const rows = await db.product.findMany({ where: { id: { in: ids }, active: true }, select: cardSelect });
  const order = new Map(ids.map((id, i) => [id, i]));
  return rows.map(toCard).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}
