"use client";

import Link from "next/link";
import { BagIcon, HeartIcon, SearchIcon, UserIcon } from "@/components/icons";
import { useSessionState } from "@/components/session-state";

function Badge({ count, tone }: { count: number; tone: "light" | "dark" }) {
  if (count <= 0) return null;
  return (
    <span
      className={`absolute -top-1 -right-1.5 flex size-4 items-center justify-center rounded-full text-[10px] leading-none font-medium ${
        tone === "dark" ? "bg-forest text-white" : "border border-white bg-chip text-ink"
      }`}
      aria-hidden="true"
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function HeaderActions() {
  const { cartCount, wishlistIds, signedIn } = useSessionState();
  const saved = wishlistIds.length;
  return (
    <>
      <Link href="/search" aria-label="Search" className="p-1 text-ink md:hidden">
        <SearchIcon width={18} height={18} />
      </Link>
      <Link
        href="/wishlist"
        className="relative hidden p-1 text-ink sm:block"
        aria-label={saved ? `Wishlist, ${saved} saved items` : "Wishlist"}
      >
        <HeartIcon />
        <Badge count={saved} tone="light" />
      </Link>
      <Link href={signedIn ? "/account" : "/login"} className="hidden p-1 text-ink sm:block" aria-label={signedIn ? "Your account" : "Sign in"}>
        <UserIcon />
      </Link>
      <Link href="/cart" className="relative p-1 text-ink" aria-label={cartCount ? `Shopping bag, ${cartCount} items` : "Shopping bag"}>
        <BagIcon />
        <Badge count={cartCount} tone="dark" />
      </Link>
    </>
  );
}
