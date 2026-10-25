import type { MetadataRoute } from "next";
import { getAllProductSlugs, getCategories } from "@/lib/catalog";
import { SITE } from "@/lib/config";

const STATIC = ["", "/shop", "/new-arrivals", "/best-sellers", "/sale", "/about", "/contact", "/faq", "/shipping-policy", "/return-policy", "/privacy-policy", "/terms-and-conditions"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), getAllProductSlugs()]);
  return [
    ...STATIC.map((path) => ({ url: `${SITE.url}${path}` })),
    ...categories.map((c) => ({ url: `${SITE.url}/${c.slug}` })),
    ...products.map((p) => ({ url: `${SITE.url}/product/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
