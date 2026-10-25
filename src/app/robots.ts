import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/account", "/cart", "/checkout", "/order-confirmation", "/api/"] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
