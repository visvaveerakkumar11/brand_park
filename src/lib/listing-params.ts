import { PRICE_BANDS, SORTS, type ListingFilters, type PriceBand, type SortKey } from "./listing-options";

export type SearchParams = Record<string, string | string[] | undefined>;

function list(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value : value ? [value] : [];
  return raw.flatMap((v) => v.split(",")).map((v) => v.trim()).filter(Boolean).slice(0, 20);
}

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** Turns untrusted query-string values into a well-formed filter object. */
export function parseFilters(sp: SearchParams): ListingFilters {
  const sort = one(sp.sort);
  const price = one(sp.price);
  const page = Number.parseInt(one(sp.page) ?? "1", 10);
  return {
    sizes: list(sp.size),
    colors: list(sp.color),
    fits: list(sp.fit),
    price: price && Object.hasOwn(PRICE_BANDS, price) ? (price as PriceBand) : undefined,
    sort: sort && Object.hasOwn(SORTS, sort) ? (sort as SortKey) : "featured",
    page: Number.isFinite(page) && page > 0 && page < 1000 ? page : 1,
  };
}

export function parseCollection(sp: SearchParams) {
  const c = one(sp.collection);
  return c && /^[a-z0-9-]{1,60}$/.test(c) ? c : undefined;
}

export function parseQuery(sp: SearchParams) {
  return (one(sp.q) ?? "").trim().slice(0, 80);
}
