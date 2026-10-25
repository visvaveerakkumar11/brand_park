const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Formats integer paise as rupees, e.g. 249900 → "₹2,499". */
export function formatPrice(paise: number) {
  return inr.format(paise / 100);
}

export function discountPercent(price: number, compareAtPrice: number | null) {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
