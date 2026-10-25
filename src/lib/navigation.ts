export const CATEGORY_LINKS = [
  { href: "/t-shirts", label: "T-Shirts" },
  { href: "/shirts", label: "Shirts" },
  { href: "/jeans", label: "Jeans" },
  { href: "/trousers", label: "Trousers" },
] as const;

export const FOOTER_LINKS = {
  Shop: [
    { href: "/shop", label: "Shop All" },
    { href: "/new-arrivals", label: "New Arrivals" },
    { href: "/best-sellers", label: "Best Sellers" },
    { href: "/shop?collection=everyday-essentials", label: "Everyday Essentials" },
    { href: "/sale", label: "Sale" },
  ],
  "Customer Service": [
    { href: "/account/orders", label: "Order Tracking" },
    { href: "/shipping-policy", label: "Shipping & Delivery" },
    { href: "/return-policy", label: "Returns & Exchanges" },
    { href: "/faq#size-guide", label: "Size Guide" },
    { href: "/faq", label: "FAQs" },
    { href: "/contact", label: "Contact Us" },
  ],
  "Brand & Policies": [
    { href: "/about", label: "About Brand Park" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-and-conditions", label: "Terms & Conditions" },
  ],
} as const;
