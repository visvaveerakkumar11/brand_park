// Listing options shared by server queries and client filter controls (no server imports).

export const SORTS = {
  featured: "Featured",
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
} as const;
export type SortKey = keyof typeof SORTS;

export const PRICE_BANDS = {
  "under-1500": { label: "Under ₹1,500", min: 0, max: 149_999 },
  "1500-2500": { label: "₹1,500 – ₹2,499", min: 150_000, max: 249_999 },
  "2500-3500": { label: "₹2,500 – ₹3,499", min: 250_000, max: 349_999 },
  "3500-plus": { label: "₹3,500 & above", min: 350_000, max: undefined },
} as const;
export type PriceBand = keyof typeof PRICE_BANDS;

/** Fixed listing scope implied by the route (e.g. /jeans, /sale). */
export type ListingScope = {
  category?: string;
  collection?: string;
  isNew?: boolean;
  bestSeller?: boolean;
  sale?: boolean;
  q?: string;
};

/** Shopper-chosen refinements from the query string. */
export type ListingFilters = {
  sizes: string[];
  colors: string[];
  fits: string[];
  price?: PriceBand;
  sort: SortKey;
  page: number;
};
