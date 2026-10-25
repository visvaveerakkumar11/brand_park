import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCollection, parseFilters } from "./listing-params";
import { listingHref } from "./listing-url";

test("ignores hostile or malformed query values", () => {
  const f = parseFilters({ price: "toString", sort: "constructor", page: "-3" });
  assert.equal(f.price, undefined);
  assert.equal(f.sort, "featured");
  assert.equal(f.page, 1);
  assert.equal(parseCollection({ collection: "../etc" }), undefined);
});

test("parses multi-value filters", () => {
  const f = parseFilters({ size: "M,L", color: ["Black", "White"], fit: "Relaxed fit", price: "1500-2500", sort: "price-asc", page: "2" });
  assert.deepEqual(f, { sizes: ["M", "L"], colors: ["Black", "White"], fits: ["Relaxed fit"], price: "1500-2500", sort: "price-asc", page: 2 });
});

test("changing a filter resets pagination; paging keeps filters", () => {
  const state = { sizes: ["M"], colors: [], fits: [], sort: "newest" as const, page: 3 };
  assert.equal(listingHref("/shop", state, { sizes: ["L"] }), "/shop?size=L&sort=newest");
  assert.equal(listingHref("/shop", state, { page: 4 }), "/shop?size=M&sort=newest&page=4");
});
