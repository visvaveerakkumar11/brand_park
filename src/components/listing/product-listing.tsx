import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCollections, getListing, PRICE_BANDS, type ListingScope } from "@/lib/catalog";
import { parseCollection, parseFilters, parseQuery, type SearchParams } from "@/lib/listing-params";
import { listingHref, type ListingState } from "@/lib/listing-url";
import { PAGE_SIZE } from "@/lib/config";
import { ProductCard } from "@/components/product/product-card";
import { ButtonLink } from "@/components/ui/button";
import { CloseIcon } from "@/components/icons";
import { FilterBar } from "./filter-bar";

type Crumb = { href?: string; label: string };

export function ProductListing({
  title,
  description,
  crumbs,
  basePath,
  scope = {},
  activeCategory,
  searchParams,
}: {
  title: string;
  description: string;
  crumbs: Crumb[];
  basePath: string;
  scope?: ListingScope;
  activeCategory?: string;
  searchParams: Promise<SearchParams>;
}) {
  return (
    <>
      <section className="bg-white pt-8 pb-6 sm:pt-10">
        <div className="container-page">
          <Breadcrumbs crumbs={crumbs} />
          <h1 className="heading-display mt-6 text-[34px] sm:text-[48px]">{title}</h1>
          <p className="mt-3 max-w-[576px] text-sm leading-6 text-ink-muted sm:text-base">{description}</p>
        </div>
      </section>
      <Suspense fallback={<ListingSkeleton />}>
        <ListingResults basePath={basePath} scope={scope} activeCategory={activeCategory} searchParams={searchParams} />
      </Suspense>
      <FitHelpBanner />
    </>
  );
}

async function ListingResults({
  basePath,
  scope,
  activeCategory,
  searchParams,
}: {
  basePath: string;
  scope: ListingScope;
  activeCategory?: string;
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const collection = parseCollection(sp);
  const q = scope.q === undefined ? undefined : parseQuery(sp);
  const view = sp.view === "3" ? 3 : 4;
  const state: ListingState = { ...filters, collection, q, view };

  const [listing, collections] = await Promise.all([
    getListing({ ...scope, collection, q }, filters),
    getCollections(),
  ]);
  if (filters.page > listing.pageCount) redirect(listingHref(basePath, state, { page: listing.pageCount }));
  const page = filters.page;
  const collectionName = collections.find((c) => c.slug === collection)?.name;

  const pills: { label: string; href: string }[] = [
    ...(collectionName ? [{ label: `Capsule: ${collectionName}`, href: listingHref(basePath, state, { collection: undefined }) }] : []),
    ...filters.sizes.map((s) => ({ label: `Size ${s}`, href: listingHref(basePath, state, { sizes: filters.sizes.filter((x) => x !== s) }) })),
    ...filters.colors.map((c) => ({ label: c, href: listingHref(basePath, state, { colors: filters.colors.filter((x) => x !== c) }) })),
    ...filters.fits.map((f) => ({ label: f, href: listingHref(basePath, state, { fits: filters.fits.filter((x) => x !== f) }) })),
    ...(filters.price ? [{ label: PRICE_BANDS[filters.price].label, href: listingHref(basePath, state, { price: undefined }) }] : []),
  ];
  const clearAll = listingHref(basePath, { ...state, sizes: [], colors: [], fits: [], price: undefined, collection: undefined });

  return (
    <>
      <FilterBar basePath={basePath} state={state} facets={listing.facets} total={listing.total} activeCategory={activeCategory} />

      <section className="bg-white pt-6 pb-16" aria-label="Products">
        <div className="container-page">
          {q !== undefined && (
            <form action="/search" role="search" className="mb-4 flex max-w-xl gap-2">
              <label htmlFor="search-page-q" className="sr-only">Search products</label>
              <input
                id="search-page-q"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Search garments, fits..."
                className="h-12 min-w-0 flex-1 rounded-[2px] border border-line bg-surface px-4 text-base focus:border-ink-subtle focus:outline-none"
              />
              <button type="submit" className="label-caps h-12 rounded-[2px] bg-ink px-6 text-white">Search</button>
            </form>
          )}
          {q !== undefined && (
            <p className="mb-4 text-sm text-ink-muted" aria-live="polite">
              {q ? (
                <>
                  {listing.total} {listing.total === 1 ? "result" : "results"} for <strong className="font-medium text-ink">&ldquo;{q}&rdquo;</strong>
                </>
              ) : (
                "Enter a search term to find garments, fits and fabrics."
              )}
            </p>
          )}

          {pills.length > 0 && (
            <ul className="mb-6 flex flex-wrap items-center gap-2" aria-label="Active filters">
              <li className="eyebrow mr-1">Active filters</li>
              {pills.map((p) => (
                <li key={p.label}>
                  <Link href={p.href} scroll={false} className="flex h-7 items-center gap-1.5 rounded-full border border-line bg-surface pr-2 pl-3 text-xs text-ink hover:border-ink-subtle">
                    {p.label}
                    <CloseIcon width={12} height={12} />
                    <span className="sr-only">Remove filter</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href={clearAll} scroll={false} className="label-caps ml-1 text-ink-muted underline hover:text-ink">Clear all</Link>
              </li>
            </ul>
          )}

          {listing.products.length === 0 ? (
            <EmptyState hasFilters={pills.length > 0} clearHref={clearAll} />
          ) : (
            <ul className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 ${view === 4 ? "lg:grid-cols-4" : ""}`}>
              {listing.products.map((p, i) => (
                <li key={p.id}>
                  <ProductCard product={p} priority={i < 4} />
                </li>
              ))}
            </ul>
          )}

          {listing.total > 0 && <Pagination basePath={basePath} state={state} page={page} pageCount={listing.pageCount} total={listing.total} />}
        </div>
      </section>
    </>
  );
}

function Pagination({ basePath, state, page, pageCount, total }: { basePath: string; state: ListingState; page: number; pageCount: number; total: number }) {
  const shown = Math.min(page * PAGE_SIZE, total);
  const pct = Math.round((shown / total) * 100);
  const pageLink = "flex size-9 items-center justify-center rounded-[2px] border text-xs font-medium";
  return (
    <div className="mx-auto mt-16 flex max-w-[576px] flex-col items-center gap-4 px-4">
      <div className="flex w-full justify-between text-[11px] leading-4 font-medium tracking-[0.05em] text-ink-muted uppercase">
        <span>
          Showing {(page - 1) * PAGE_SIZE + 1}–{shown} of {total}
        </span>
        <span>{pct}% viewed</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Catalogue viewed">
        <div className="h-full bg-forest" style={{ width: `${pct}%` }} />
      </div>
      {page < pageCount && (
        <ButtonLink href={listingHref(basePath, state, { page: page + 1 })} variant="dark" className="mt-2">
          Next page
        </ButtonLink>
      )}
      {pageCount > 1 && (
        <nav aria-label="Pagination" className="mt-2">
          <ul className="flex gap-1">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <li key={n}>
                <Link
                  href={listingHref(basePath, state, { page: n })}
                  aria-current={n === page ? "page" : undefined}
                  className={`${pageLink} ${n === page ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink-subtle"}`}
                >
                  {n}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

function EmptyState({ hasFilters, clearHref }: { hasFilters: boolean; clearHref: string }) {
  return (
    <div className="flex flex-col items-center border border-line bg-canvas px-6 py-20 text-center">
      <p className="eyebrow">Nothing here yet</p>
      <h2 className="mt-2 text-xl font-medium uppercase">No products match</h2>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        {hasFilters ? "Try removing a filter or two to see more of the collection." : "Check back soon, or explore the full collection."}
      </p>
      <div className="mt-6 flex gap-2">
        {hasFilters && <ButtonLink href={clearHref} variant="dark">Clear filters</ButtonLink>}
        <ButtonLink href="/shop" variant="outline">Shop all</ButtonLink>
      </div>
    </div>
  );
}

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-[11px] leading-4 font-medium tracking-[0.1em] text-ink-muted uppercase">
        {crumbs.map((c, i) => (
          <li key={c.label} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {c.href ? (
              <Link href={c.href} className="hover:text-ink">{c.label}</Link>
            ) : (
              <span aria-current="page" className="text-ink">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function ListingSkeleton() {
  return (
    <div className="container-page pt-6 pb-16" aria-busy="true" aria-label="Loading products">
      <div className="mb-6 h-12 animate-pulse bg-surface" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] animate-pulse bg-surface" />
            <div className="mt-3 h-3 w-2/3 animate-pulse bg-surface" />
            <div className="mt-2 h-3 w-1/3 animate-pulse bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FitHelpBanner() {
  return (
    <section className="border-t border-line bg-surface py-16" aria-labelledby="fit-help">
      <div className="container-page flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[640px]">
          <p className="eyebrow">Fit &amp; style assistance</p>
          <h2 id="fit-help" className="mt-2 text-[24px] leading-8 font-medium tracking-[-0.02em] sm:text-[28px] sm:leading-9">
            Not sure about your size or silhouette?
          </h2>
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            Every product lists its fit, fabric and care. Compare your measurements with our size guide, or ask our team for
            help choosing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/faq#size-guide" variant="dark">Open size guide</ButtonLink>
          <ButtonLink href="/contact" variant="outline">Contact us</ButtonLink>
        </div>
      </div>
    </section>
  );
}
