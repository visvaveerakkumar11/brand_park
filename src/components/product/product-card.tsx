import Image from "next/image";
import Link from "next/link";
import type { ProductCardData } from "@/lib/catalog";
import { discountPercent, formatPrice } from "@/lib/money";
import { WishlistButton } from "./wishlist-button";
import { QuickAdd } from "./quick-add";

const LOW_STOCK = 5;

export function ProductPrice({ price, compareAtPrice, className = "" }: { price: number; compareAtPrice: number | null; className?: string }) {
  const onSale = compareAtPrice !== null && compareAtPrice > price;
  return (
    <p className={`flex items-baseline gap-2 text-sm leading-[18px] font-medium ${className}`}>
      <span className={onSale ? "text-sale" : "text-ink"}>
        {onSale && <span className="sr-only">Sale price </span>}
        {formatPrice(price)}
      </span>
      {onSale && (
        <s className="text-xs text-ink-subtle">
          <span className="sr-only">Original price </span>
          {formatPrice(compareAtPrice)}
        </s>
      )}
    </p>
  );
}

function badgeFor(p: ProductCardData) {
  const pct = discountPercent(p.price, p.compareAtPrice);
  if (p.totalStock === 0) return { text: "Sold out", tone: "bg-white/90 text-ink-muted" };
  if (pct > 0) return { text: `-${pct}% Sale`, tone: "bg-sale text-white" };
  if (p.isNew) return { text: "New", tone: "bg-white/90 text-ink" };
  if (p.isBestSeller) return { text: "Popular", tone: "bg-ink text-white" };
  return null;
}

export function ProductCard({
  product,
  showStock = false,
  priority = false,
}: {
  product: ProductCardData;
  showStock?: boolean;
  priority?: boolean;
}) {
  const badge = badgeFor(product);
  const href = `/product/${product.slug}`;
  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden border border-line bg-stone">
        <Image
          src={product.image.url}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1280px) 278px, (min-width: 768px) 25vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        {badge && (
          <span className={`absolute top-3 left-3 px-2 py-1 text-[11px] leading-[14px] font-medium tracking-[0.05em] uppercase ${badge.tone}`}>
            {badge.text}
          </span>
        )}
        <WishlistButton
          productId={product.id}
          productName={product.name}
          className="absolute top-2 right-2 z-10 size-8 bg-white/80 hover:bg-white"
        />
        {product.sizes.length > 0 && product.totalStock > 0 && <QuickAdd sizes={product.sizes} productName={product.name} />}
      </div>

      <div className="flex flex-col gap-1 pt-2">
        <div className="flex min-h-[22px] items-center gap-1">
          {product.colors.map((c) => (
            <span
              key={c.name}
              title={c.name}
              className="size-4 rounded-full border border-white ring-1 ring-line"
              style={{ backgroundColor: c.hex }}
            />
          ))}
          <span className="ml-1 text-[11px] leading-[14px] font-medium tracking-[0.05em] text-ink-muted">
            {product.colors.length === 1 ? product.colors[0].name : `${product.colors.length} Colours`}
          </span>
        </div>
        {showStock && <StockStatus stock={product.totalStock} />}
        <h3 className="text-sm leading-5 font-medium text-ink">
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-has-[a:focus-visible]:underline">
            {product.name}
          </Link>
        </h3>
        <ProductPrice price={product.price} compareAtPrice={product.compareAtPrice} />
      </div>
    </article>
  );
}

export function StockStatus({ stock }: { stock: number }) {
  const low = stock > 0 && stock <= LOW_STOCK;
  const tone = stock === 0 ? "text-ink-subtle" : low ? "text-sale" : "text-forest";
  const dot = stock === 0 ? "bg-ink-subtle" : low ? "bg-sale" : "bg-forest";
  const text = stock === 0 ? "Sold out" : low ? `Only ${stock} left` : "In stock";
  return (
    <p className={`flex items-center gap-1 text-[11px] leading-[14px] font-medium tracking-[0.05em] ${tone}`}>
      <span className={`size-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {text}
    </p>
  );
}
