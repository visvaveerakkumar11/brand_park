"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/profile", label: "Profile" },
  { href: "/wishlist", label: "Wishlist" },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account">
      <ul className="flex gap-1 overflow-x-auto border-b border-line lg:flex-col lg:border-b-0">
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`label-caps block px-3 py-3 whitespace-nowrap lg:border-l-2 ${active ? "border-ink text-ink max-lg:border-b-2" : "border-transparent text-ink-muted hover:text-ink"}`}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
