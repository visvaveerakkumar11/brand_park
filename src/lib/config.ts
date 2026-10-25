/**
 * Store-wide business rules. Values are in paise (₹1 = 100).
 *
 * The free-shipping threshold and 14-day return window come from the Figma
 * design. STANDARD_SHIPPING_FEE is a development placeholder: confirm all
 * three with the business before launch.
 */
export const FREE_SHIPPING_THRESHOLD = 199_900;
export const STANDARD_SHIPPING_FEE = 9_900;
export const RETURN_WINDOW_DAYS = 14;

/** Upper bound on the quantity of a single variant per cart line. */
export const MAX_LINE_QUANTITY = 10;

export const PAGE_SIZE = 12;

export const SITE = {
  name: "Brand Park",
  tagline: "Your Style. Your Space.",
  description:
    "Brand Park is a men's clothing store for contemporary everyday essentials — t-shirts, shirts, jeans and trousers.",
  url: process.env.APP_URL ?? "http://localhost:3000",
} as const;
