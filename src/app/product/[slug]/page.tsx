import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAllProductSlugs, getProduct } from "@/lib/catalog";
import { FREE_SHIPPING_THRESHOLD, RETURN_WINDOW_DAYS, SITE } from "@/lib/config";
import { discountPercent, formatPrice } from "@/lib/money";
import { Breadcrumbs } from "@/components/listing/product-listing";
import { Gallery } from "@/components/product/gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { ProductCard, ProductPrice } from "@/components/product/product-card";
import { SectionHeader } from "@/components/section-header";

export async function generateStaticParams() {
  const products = await getAllProductSlugs();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const data = await getProduct((await params).slug);
  if (!data) return {};
  const { product } = data;
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title: product.name, description: product.description, images: product.images.map((i) => ({ url: i.url, alt: i.alt })) },
  };
}

export default function ProductPage({ params }: PageProps<"/product/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: { params: PageProps<"/product/[slug]">["params"] }) {
  const data = await getProduct((await params).slug);
  if (!data) notFound();
  const { product, related } = data;
  const pct = discountPercent(product.price, product.compareAtPrice);
  const inStock = product.variants.some((v) => v.stock > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => new URL(i.url, SITE.url).toString()),
    sku: product.slug,
    brand: { "@type": "Brand", name: SITE.name },
    category: product.category.name,
    offers: {
      "@type": "Offer",
      url: new URL(`/product/${product.slug}`, SITE.url).toString(),
      priceCurrency: "INR",
      price: (product.price / 100).toFixed(2),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-page py-8">
        <Breadcrumbs
          crumbs={[
            { href: "/", label: "Home" },
            { href: `/${product.category.slug}`, label: product.category.name },
            { label: product.name },
          ]}
        />
        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-12">
          <Gallery images={product.images} name={product.name} />

          <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
            <div className="flex flex-col gap-2 border-b border-line pb-6">
              <p className="eyebrow">{product.category.name} · {product.fit}</p>
              <h1 className="text-[28px] leading-9 font-medium tracking-[-0.02em]">{product.name}</h1>
              <div className="flex items-center gap-3">
                <ProductPrice price={product.price} compareAtPrice={product.compareAtPrice} className="text-xl leading-7 [&_s]:text-sm" />
                {pct > 0 && <span className="bg-sale px-2 py-0.5 text-[11px] font-medium tracking-[0.05em] text-white uppercase">-{pct}%</span>}
              </div>
            </div>

            <PurchasePanel productId={product.id} productName={product.name} variants={product.variants} />

            <div className="divide-y divide-line border-y border-line">
              <Detail title="Description & silhouette" open>
                <p>{product.description}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5">
                  {product.details.map((d) => <li key={d}>{d}</li>)}
                </ul>
              </Detail>
              <Detail title="Materials & garment care">
                <p><span className="font-medium text-ink">Fabric:</span> {product.material}</p>
                <p className="mt-2"><span className="font-medium text-ink">Fit:</span> {product.fit}</p>
                <p className="mt-2"><span className="font-medium text-ink">Care:</span> {product.care}</p>
              </Detail>
              <Detail title="Shipping & returns">
                <p>Free delivery on orders above {formatPrice(FREE_SHIPPING_THRESHOLD)}. Returns are accepted within {RETURN_WINDOW_DAYS} days of delivery.</p>
                <p className="mt-2">
                  See our <Link href="/shipping-policy" className="underline">shipping policy</Link> and{" "}
                  <Link href="/return-policy" className="underline">return policy</Link> for details.
                </p>
              </Detail>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line bg-canvas py-16" aria-label="Complete the look">
          <div className="container-page">
            <SectionHeader eyebrow="Curated pairings" title="Complete the look" />
            <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {related.map((p) => (
                <li key={p.id}><ProductCard product={p} /></li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

function Detail({ title, open = false, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details className="group py-4" open={open}>
      <summary className="label-caps flex cursor-pointer list-none items-center justify-between text-ink [&::-webkit-details-marker]:hidden">
        {title}
        <span className="text-lg leading-none transition-transform group-open:rotate-45" aria-hidden="true">+</span>
      </summary>
      <div className="pt-3 text-sm leading-6 text-ink-muted">{children}</div>
    </details>
  );
}

function ProductSkeleton() {
  return (
    <div className="container-page py-8" aria-busy="true" aria-label="Loading product">
      <div className="h-4 w-64 animate-pulse bg-surface" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-12">
        <div className="aspect-[3/4] animate-pulse bg-surface" />
        <div className="flex flex-col gap-4">
          <div className="h-3 w-32 animate-pulse bg-surface" />
          <div className="h-8 w-3/4 animate-pulse bg-surface" />
          <div className="h-6 w-24 animate-pulse bg-surface" />
          <div className="mt-6 h-11 animate-pulse bg-surface" />
          <div className="h-12 animate-pulse bg-surface" />
        </div>
      </div>
    </div>
  );
}
