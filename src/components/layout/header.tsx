import Image from "next/image";
import Link from "next/link";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";
import { formatPrice } from "@/lib/money";
import { CATEGORY_LINKS } from "@/lib/navigation";
import { ChevronDownIcon, SearchIcon } from "@/components/icons";
import { HeaderActions } from "./header-actions";
import { MobileNav } from "./mobile-nav";

const navLink = "label-caps flex h-20 items-center whitespace-nowrap text-ink-muted transition-colors hover:text-ink";

export function Header() {
  return (
    <>
      <div className="border-b border-forest/20 bg-forest text-white">
        <div className="container-page flex h-9 items-center justify-between gap-4 text-[11px] leading-[14px] font-medium tracking-[0.05em] uppercase">
          <p className="truncate">
            Free delivery across India on orders above {formatPrice(FREE_SHIPPING_THRESHOLD)}
            <span className="mx-2 hidden sm:inline" aria-hidden="true">|</span>
            <span className="hidden font-normal sm:inline">Discover your everyday style</span>
          </p>
          <Link href="/shipping-policy" className="shrink-0 tracking-[0.1em] hover:underline">
            Details
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-20">
          <div className="flex items-center gap-3">
            <MobileNav />
            <Link href="/" aria-label="Brand Park home" className="shrink-0">
              <Image src="/images/brand/logo.png" alt="Brand Park" width={160} height={32} priority unoptimized className="h-6 w-auto lg:h-8" />
            </Link>
          </div>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-6">
              <li><Link href="/new-arrivals" className={navLink}>New Arrivals</Link></li>
              <li><Link href="/shop" className={navLink}>Shop All</Link></li>
              <li className="group relative">
                <Link href="/shop" className={`${navLink} gap-1`} aria-haspopup="true">
                  Clothing <ChevronDownIcon className="transition-transform group-focus-within:rotate-180 group-hover:rotate-180" />
                </Link>
                <ul className="invisible absolute top-full left-1/2 w-48 -translate-x-1/2 border border-line bg-white py-2 opacity-0 shadow-sm transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  {CATEGORY_LINKS.map((c) => (
                    <li key={c.href}>
                      <Link href={c.href} className="label-caps block px-4 py-2.5 text-ink-muted hover:bg-surface hover:text-ink">
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li><Link href="/best-sellers" className={navLink}>Best Sellers</Link></li>
              <li>
                <Link href="/sale" className={`${navLink} gap-1.5`}>
                  Sale <span className="size-1.5 rounded-full bg-sale" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-4 lg:gap-6">
            <form action="/search" role="search" className="relative hidden md:block">
              <label htmlFor="header-search" className="sr-only">Search products</label>
              <SearchIcon className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-subtle" />
              <input
                id="header-search"
                name="q"
                type="search"
                placeholder="Search garments, fits..."
                className="h-10 w-[230px] rounded-[2px] border border-line bg-surface pr-4 pl-9 text-sm text-ink placeholder:text-ink-subtle focus:border-ink-subtle focus:outline-none"
              />
            </form>
            <HeaderActions />
          </div>
        </div>
      </header>
    </>
  );
}
