"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { PRICE_BANDS, SORTS, type PriceBand, type SortKey } from "@/lib/listing-options";
import { listingHref, toggle, type ListingState } from "@/lib/listing-url";
import { CATEGORY_LINKS } from "@/lib/navigation";
import { CloseIcon } from "@/components/icons";
import { buttonClass } from "@/components/ui/button";

type Facets = { sizes: string[]; colors: { name: string; hex: string }[]; fits: string[] };

const selectClass =
  "label-caps h-10 cursor-pointer appearance-none rounded-[2px] border border-line bg-white bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%226%22><path d=%22M1 1l4 4 4-4%22 fill=%22none%22 stroke=%22%23414944%22 stroke-width=%221.4%22/></svg>')] bg-[length:10px_6px] bg-[right_12px_center] bg-no-repeat pr-8 pl-3 text-ink hover:border-ink-subtle";

export function FilterBar({
  basePath,
  state,
  facets,
  total,
  activeCategory,
}: {
  basePath: string;
  state: ListingState;
  facets: Facets;
  total: number;
  activeCategory?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Remounting the drawer on each open resets its draft selections to the current filters.
  const [drawerKey, setDrawerKey] = useState(0);

  const go = (changes: Partial<ListingState>) =>
    startTransition(() => router.push(listingHref(basePath, state, changes), { scroll: false }));

  const activeCount = state.sizes.length + state.colors.length + state.fits.length + (state.price ? 1 : 0);

  return (
    <div className="sticky top-16 z-30 border-b border-line bg-white/95 backdrop-blur lg:top-20" data-pending={pending || undefined}>
      <div className="container-page flex flex-wrap items-center justify-between gap-3 py-2 lg:h-16 lg:py-0">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => {
              setDrawerKey((k) => k + 1);
              setDrawerOpen(true);
            }} className={buttonClass("dark", "h-10 px-4")} aria-haspopup="dialog">
            Filters{activeCount > 0 && ` (${activeCount})`}
          </button>

          <label className="sr-only" htmlFor="quick-category">Category</label>
          <select
            id="quick-category"
            className={`${selectClass} hidden md:block`}
            value={activeCategory ?? ""}
            onChange={(e) => startTransition(() => router.push(listingHref(e.target.value ? `/${e.target.value}` : "/shop", { ...state, page: 1 })))}
          >
            <option value="">All categories</option>
            {CATEGORY_LINKS.map((c) => (
              <option key={c.href} value={c.href.slice(1)}>{c.label}</option>
            ))}
          </select>

          <label className="sr-only" htmlFor="quick-size">Size</label>
          <select
            id="quick-size"
            className={`${selectClass} hidden sm:block`}
            value={state.sizes.length === 1 ? state.sizes[0] : ""}
            onChange={(e) => go({ sizes: e.target.value ? [e.target.value] : [] })}
          >
            <option value="">{state.sizes.length > 1 ? `${state.sizes.length} sizes` : "Size"}</option>
            {facets.sizes.map((s) => <option key={s} value={s}>Size {s}</option>)}
          </select>

          <label className="sr-only" htmlFor="quick-fit">Fit</label>
          <select
            id="quick-fit"
            className={`${selectClass} hidden lg:block`}
            value={state.fits.length === 1 ? state.fits[0] : ""}
            onChange={(e) => go({ fits: e.target.value ? [e.target.value] : [] })}
          >
            <option value="">{state.fits.length > 1 ? `${state.fits.length} fits` : "Fit"}</option>
            {facets.fits.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>

          <label className="sr-only" htmlFor="quick-price">Price</label>
          <select
            id="quick-price"
            className={`${selectClass} hidden lg:block`}
            value={state.price ?? ""}
            onChange={(e) => go({ price: (e.target.value || undefined) as PriceBand | undefined })}
          >
            <option value="">Price</option>
            {Object.entries(PRICE_BANDS).map(([k, b]) => <option key={k} value={k}>{b.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <p className="hidden text-xs text-ink-muted xl:block" aria-live="polite">
            {total} {total === 1 ? "product" : "products"}
          </p>
          <div className="flex items-center gap-1">
            <label htmlFor="sort" className="label-caps text-ink-muted">Sort by</label>
            <select id="sort" className={selectClass} value={state.sort} onChange={(e) => go({ sort: e.target.value as SortKey })}>
              {Object.entries(SORTS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </div>
          <div className="hidden items-center rounded-[2px] border border-line p-1 lg:flex" role="group" aria-label="Grid density">
            {([3, 4] as const).map((cols) => {
              const active = (state.view ?? 4) === cols;
              return (
                <Link
                  key={cols}
                  href={listingHref(basePath, state, { view: cols })}
                  scroll={false}
                  aria-label={`${cols} columns`}
                  aria-current={active || undefined}
                  className={`flex size-8 items-center justify-center rounded-[2px] ${active ? "bg-ink text-white" : "text-ink-muted hover:text-ink"}`}
                >
                  <span className={`grid ${cols === 3 ? "grid-cols-3" : "grid-cols-4"} gap-[2px]`} aria-hidden="true">
                    {Array.from({ length: cols * 2 }, (_, i) => <span key={i} className="size-[3px] bg-current" />)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <FilterDrawer
        key={drawerKey}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        facets={facets}
        state={state}
        onApply={(changes) => {
          setDrawerOpen(false);
          go(changes);
        }}
      />
    </div>
  );
}

function FilterDrawer({
  open,
  onClose,
  facets,
  state,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  facets: Facets;
  state: ListingState;
  onApply: (changes: Partial<ListingState>) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState({ sizes: state.sizes, colors: state.colors, fits: state.fits, price: state.price });

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const legend = "text-[11px] leading-[14px] font-semibold tracking-[0.1em] text-ink uppercase mb-3";
  const chip = (on: boolean) =>
    `flex h-10 min-w-12 items-center justify-center rounded-[2px] border px-3 text-xs font-medium ${on ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink-subtle"}`;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="ml-auto h-dvh max-h-none w-[min(24rem,100vw)] max-w-none bg-white p-0 backdrop:bg-black/40"
      aria-labelledby="filter-title"
    >
      <form
        className="flex h-full flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          onApply(draft);
        }}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 id="filter-title" className="text-sm font-semibold tracking-[0.1em] uppercase">Filter collection</h2>
          <button type="button" onClick={onClose} aria-label="Close filters" className="p-1"><CloseIcon /></button>
        </div>
        <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
          <fieldset>
            <legend className={legend}>Size</legend>
            <div className="flex flex-wrap gap-2">
              {facets.sizes.map((s) => {
                const on = draft.sizes.includes(s);
                return (
                  <label key={s} className={`${chip(on)} cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-forest`}>
                    <input type="checkbox" className="sr-only" checked={on} onChange={() => setDraft({ ...draft, sizes: toggle(draft.sizes, s) })} />
                    {s}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <fieldset>
            <legend className={legend}>Palette &amp; tone</legend>
            <div className="flex flex-wrap gap-3">
              {facets.colors.map((c) => {
                const on = draft.colors.includes(c.name);
                return (
                  <label key={c.name} className="flex cursor-pointer items-center gap-2 text-xs text-ink has-[:focus-visible]:underline">
                    <input type="checkbox" className="sr-only" checked={on} onChange={() => setDraft({ ...draft, colors: toggle(draft.colors, c.name) })} />
                    <span
                      className={`size-6 rounded-full border-2 ${on ? "border-ink ring-2 ring-white ring-inset" : "border-line"}`}
                      style={{ backgroundColor: c.hex }}
                      aria-hidden="true"
                    />
                    {c.name}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <fieldset>
            <legend className={legend}>Garment silhouette</legend>
            <div className="space-y-2">
              {facets.fits.map((f) => (
                <label key={f} className="flex cursor-pointer items-center gap-3 text-sm text-ink">
                  <input type="checkbox" className="size-4 accent-forest" checked={draft.fits.includes(f)} onChange={() => setDraft({ ...draft, fits: toggle(draft.fits, f) })} />
                  {f}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className={legend}>Price</legend>
            <div className="space-y-2">
              {[["", "Any price"] as const, ...Object.entries(PRICE_BANDS).map(([k, b]) => [k, b.label] as const)].map(([k, label]) => (
                <label key={k} className="flex cursor-pointer items-center gap-3 text-sm text-ink">
                  <input
                    type="radio"
                    name="price"
                    className="size-4 accent-forest"
                    checked={(draft.price ?? "") === k}
                    onChange={() => setDraft({ ...draft, price: (k || undefined) as PriceBand | undefined })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-line p-6">
          <button type="button" className={buttonClass("outline")} onClick={() => onApply({ sizes: [], colors: [], fits: [], price: undefined })}>
            Reset
          </button>
          <button type="submit" className={buttonClass("forest")}>Apply filters</button>
        </div>
      </form>
    </dialog>
  );
}
