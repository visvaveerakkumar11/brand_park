import type { ListingFilters } from "./listing-options";

/** Everything a listing URL can carry. */
export type ListingState = ListingFilters & { collection?: string; q?: string; view?: 3 | 4 };

/** Builds a listing URL from the current state plus changes. Changing a filter resets to page 1. */
export function listingHref(basePath: string, state: ListingState, changes: Partial<ListingState> = {}) {
  const resetsPage = Object.keys(changes).some((k) => k !== "page" && k !== "view");
  const next: ListingState = { ...state, ...changes, page: resetsPage ? 1 : (changes.page ?? state.page) };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.collection) params.set("collection", next.collection);
  if (next.sizes.length) params.set("size", next.sizes.join(","));
  if (next.colors.length) params.set("color", next.colors.join(","));
  if (next.fits.length) params.set("fit", next.fits.join(","));
  if (next.price) params.set("price", next.price);
  if (next.sort !== "featured") params.set("sort", next.sort);
  if (next.view === 3) params.set("view", "3");
  if (next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
