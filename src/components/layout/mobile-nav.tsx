"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CATEGORY_LINKS } from "@/lib/navigation";
import { CloseIcon, MenuIcon, SearchIcon } from "@/components/icons";
import { useSessionState } from "@/components/session-state";

const LINKS = [
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/shop", label: "Shop All" },
  ...CATEGORY_LINKS,
  { href: "/best-sellers", label: "Best Sellers" },
  { href: "/sale", label: "Sale" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const { signedIn } = useSessionState();

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <button type="button" className="p-1 text-ink lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
        <MenuIcon />
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        // Close on backdrop clicks and after following any link inside.
        onClick={(e) => {
          if (e.target === e.currentTarget || (e.target as HTMLElement).closest("a")) setOpen(false);
        }}
        className="m-0 h-dvh max-h-none w-[min(22rem,88vw)] max-w-none bg-white p-0 backdrop:bg-black/40"
        aria-label="Menu"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line px-4 py-4">
            <span className="eyebrow">Menu</span>
            <button type="button" className="p-1" aria-label="Close menu" onClick={() => setOpen(false)}>
              <CloseIcon />
            </button>
          </div>
          <form action="/search" role="search" className="relative border-b border-line p-4">
            <label htmlFor="mobile-search" className="sr-only">Search products</label>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-8 -translate-y-1/2 text-ink-subtle" />
            <input
              id="mobile-search"
              name="q"
              type="search"
              placeholder="Search garments, fits..."
              className="h-11 w-full rounded-[2px] border border-line bg-surface pr-4 pl-10 text-base focus:outline-none"
            />
          </form>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto">
            <ul>
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="label-caps block border-b border-line px-4 py-4 text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="grid grid-cols-2 gap-px border-t border-line bg-line">
            <Link href="/wishlist" className="label-caps bg-white px-4 py-4 text-center">Wishlist</Link>
            <Link href={signedIn ? "/account" : "/login"} className="label-caps bg-white px-4 py-4 text-center">
              {signedIn ? "Account" : "Sign In"}
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
