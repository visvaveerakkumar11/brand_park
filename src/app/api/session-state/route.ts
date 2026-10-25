import { getCurrentUser } from "@/lib/auth";
import { getCartCount, getWishlistProductIds } from "@/lib/cart";

/** Per-visitor header state (bag count, saved items) fetched by the client. */
export async function GET() {
  const [user, cartCount, wishlistIds] = await Promise.all([
    getCurrentUser(),
    getCartCount(),
    getWishlistProductIds(),
  ]);
  return Response.json(
    { signedIn: Boolean(user), firstName: user?.name.split(" ")[0] ?? null, cartCount, wishlistIds },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
