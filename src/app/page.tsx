import Image from "next/image";
import Link from "next/link";
import { getCategories, getCollections, getProductCards } from "@/lib/catalog";
import { FREE_SHIPPING_THRESHOLD, RETURN_WINDOW_DAYS } from "@/lib/config";
import { formatPrice } from "@/lib/money";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, ChatIcon, LeafIcon, ReturnIcon, TruckIcon } from "@/components/icons";
import { ProductCard } from "@/components/product/product-card";
import { ProductRail } from "@/components/product/product-rail";
import { SectionHeader, TextLink } from "@/components/section-header";
import { NewsletterForm } from "@/components/newsletter-form";

export default async function HomePage() {
  const [categories, collections, newArrivals, bestSellers] = await Promise.all([
    getCategories(),
    getCollections(),
    getProductCards({ isNew: true }, 4, "newest"),
    getProductCards({ bestSeller: true }, 8),
  ]);

  return (
    <>
      <Hero />
      <ValueProps />

      {/* Curated departments */}
      <section className="border-b border-line bg-canvas py-16" aria-label="Shop by department">
        <div className="container-page">
          <SectionHeader eyebrow="Wardrobe structure" title="Curated departments" aside={<TextLink href="/shop">Browse catalog</TextLink>} />
          <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}`} className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden border border-line bg-surface p-4">
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 278px, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0" aria-hidden="true" />
                  <span className="relative flex flex-col gap-1 pb-0.5">
                    <span className="text-lg leading-[26px] font-medium tracking-[0.025em] text-white uppercase sm:text-xl">{c.name}</span>
                    <span className="text-[11px] leading-[14px] font-medium tracking-[0.05em] text-cream/80">
                      {c._count.products} {c._count.products === 1 ? "Product" : "Products"}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Just landed */}
      <section className="border-b border-line bg-white py-16" aria-label="New arrivals">
        <div className="container-page">
          <SectionHeader
            eyebrow="New arrivals"
            title="Just landed"
            dot
            aside={
              <p className="max-w-[440px] text-sm leading-5 text-ink-muted">
                Refined proportions and breathable weights formulated for climate versatility and daily wearability.
              </p>
            }
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <ButtonLink href="/new-arrivals" variant="outline">
              View all new arrivals <ArrowRightIcon width={12} height={9} />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Shop by aesthetic */}
      <section id="collections" className="scroll-mt-24 border-b border-line bg-canvas py-16" aria-label="Shop by aesthetic">
        <div className="container-page">
          <SectionHeader eyebrow="Wardrobe capsules" title="Shop by aesthetic" />
          <ul className="grid gap-4 md:grid-cols-12">
            {collections.map((c, i) => {
              const large = i === 0 || i === 3;
              const tall = i < 2;
              return (
                <li key={c.slug} className={large ? "md:col-span-7" : "md:col-span-5"}>
                  <Link
                    href={`/shop?collection=${c.slug}`}
                    className={`group relative flex flex-col justify-end overflow-hidden border border-line bg-surface p-6 sm:p-10 ${tall ? "h-[420px] md:h-[500px]" : "h-[340px] md:h-[380px]"}`}
                  >
                    <Image
                      src={c.image}
                      alt=""
                      fill
                      sizes={large ? "(min-width: 768px) 684px, 100vw" : "(min-width: 768px) 484px, 100vw"}
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" aria-hidden="true" />
                    <span className="relative flex max-w-[448px] flex-col gap-1">
                      <span className="text-[11px] leading-[14px] font-medium tracking-[0.1em] text-white uppercase">
                        Capsule {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`font-medium text-white uppercase ${tall ? "text-[22px] leading-7 tracking-[-0.025em] sm:text-[28px] sm:leading-9" : "text-xl leading-[26px] tracking-[-0.025em]"}`}
                      >
                        {c.name}
                      </span>
                      <span className="text-sm leading-5 text-cream/80">{c.description}</span>
                      <span className="label-caps mt-2 inline-flex items-center gap-1 text-white">
                        Shop capsule <ArrowRightIcon />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Best sellers */}
      <section className="border-b border-line bg-white py-16" aria-label="Best sellers">
        <div className="container-page">
          <ProductRail eyebrow="Most revered" title="Best sellers">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} showStock />
            ))}
          </ProductRail>
        </div>
      </section>

      {/* Promotional banner */}
      <section className="bg-stone py-10" aria-label="Delivery offer">
        <div className="container-page">
          <div className="flex flex-col gap-6 border border-line bg-white p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-[2px] bg-forest-600 text-white">
                <TruckIcon />
              </span>
              <div className="flex flex-col gap-0.5">
                <p className="text-[11px] leading-[14px] font-semibold tracking-[0.1em] text-forest uppercase">Complimentary delivery</p>
                <h2 className="text-lg leading-[26px] font-medium tracking-[-0.025em] uppercase sm:text-xl">Your next favourite outfit starts here</h2>
                <p className="max-w-[530px] pt-0.5 text-sm leading-5 text-ink-muted">
                  Free delivery on orders above {formatPrice(FREE_SHIPPING_THRESHOLD)}. Build your look from new-season shirts, denim and trousers.
                </p>
              </div>
            </div>
            <ButtonLink href="/shop" variant="forest" className="shrink-0">
              Explore the collection
            </ButtonLink>
          </div>
        </div>
      </section>

      <BrandStory categoryCount={categories.length} />

      {/* Newsletter */}
      <section className="border-y border-line bg-surface py-16" aria-labelledby="newsletter-heading">
        <div className="container-page flex flex-col items-center text-center">
          <p className="eyebrow pb-1">Brand Park community</p>
          <h2 id="newsletter-heading" className="heading-display pb-2 uppercase">Stay in style.</h2>
          <p className="max-w-[512px] pb-6 text-base leading-6 text-ink-muted">
            Discover new collections, style inspiration, and member releases from Brand Park.
          </p>
          <NewsletterForm className="w-full max-w-[448px] text-left" />
          <p className="eyebrow mt-1 normal-case tracking-[0.05em]">
            By subscribing you agree to our{" "}
            <Link href="/privacy-policy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}

function Hero() {
  return (
    <section className="relative flex h-[560px] items-end overflow-hidden bg-surface sm:h-[656px]">
      <Image
        src="/images/brand/hero.jpg"
        alt="A man in a dark jacket and tan chinos sitting in a circular concrete window"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[50%_58%]"
      />
      <span className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-black/10" aria-hidden="true" />
      <div className="container-page relative py-12 sm:py-16">
        <div className="flex max-w-[672px] flex-col gap-4">
          <p className="flex w-fit items-center gap-2 rounded-[2px] border border-outline/30 bg-canvas/90 px-2 py-1 text-[11px] leading-[14px] font-medium tracking-[0.1em] text-ink uppercase">
            <span className="size-1.5 rounded-full bg-forest" aria-hidden="true" />
            The men&apos;s everyday edit
          </p>
          <h1 className="heading-display text-white">Find Your Everyday Style.</h1>
          <p className="max-w-[544px] text-base leading-6 font-light text-cream/90">
            Thoughtfully styled essentials and modern fashion for wherever life takes you. Engineered for architectural
            silhouette and effortless tactility.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <ButtonLink href="/new-arrivals" variant="dark">Shop new arrivals</ButtonLink>
            <ButtonLink href="#collections" variant="light">Explore collections</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueProps() {
  const items = [
    { Icon: TruckIcon, title: "Free delivery", text: `On all orders above ${formatPrice(FREE_SHIPPING_THRESHOLD)}` },
    { Icon: ReturnIcon, title: `${RETURN_WINDOW_DAYS}-day returns`, text: "See our return policy for details" },
    { Icon: LeafIcon, title: "Clear materials", text: "Fabric, fit and care on every product" },
    { Icon: ChatIcon, title: "Here to help", text: "Questions? Contact our team" },
  ];
  return (
    <section aria-label="Why shop with us" className="border-b border-line bg-white py-4">
      <ul className="container-page grid grid-cols-1 gap-4 py-1 xs:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {items.map(({ Icon, title, text }) => (
          <li key={title} className="flex items-start gap-2">
            <span className="flex h-4 w-5 shrink-0 items-center justify-center text-forest">
              <Icon />
            </span>
            <span className="flex flex-col">
              <span className="text-xs leading-4 font-semibold tracking-[0.05em] text-ink uppercase">{title}</span>
              <span className="text-[11px] leading-[14px] font-medium tracking-[0.1em] text-ink-muted">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BrandStory({ categoryCount }: { categoryCount: number }) {
  const facts = [
    { value: String(categoryCount), label: "Core categories" },
    { value: formatPrice(FREE_SHIPPING_THRESHOLD), label: "Free delivery above" },
    { value: `${RETURN_WINDOW_DAYS}-Day`, label: "Return window" },
  ];
  return (
    <section className="border-b border-line bg-canvas py-16" aria-labelledby="story-heading">
      <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-6">
        <div className="flex max-w-[540px] flex-col gap-6">
          <p className="eyebrow flex items-center gap-2">
            <span className="h-px w-8 bg-ink" aria-hidden="true" />
            The Brand Park manifesto
          </p>
          <h2 id="story-heading" className="heading-display uppercase">
            Good style.
            <br />
            Everyday comfort.
          </h2>
          <p className="text-base leading-[26px] text-ink-muted">
            Brand Park brings together versatile clothing, contemporary design, and effortless style to help you feel
            confident in what you wear. We believe great menswear should be simple to choose and easy to live in.
          </p>
          <p className="text-sm leading-[23px] text-ink-muted">
            Our edit focuses on the pieces men reach for most — tees, shirts, jeans and trousers — in considered fabrics and
            dependable fits.
          </p>
          <dl className="grid grid-cols-3 gap-4 border-t border-line pt-4">
            {facts.map((f) => (
              <div key={f.label} className="flex flex-col-reverse gap-1">
                <dt className="text-[11px] leading-[14px] font-medium tracking-[0.05em] text-ink-muted uppercase">{f.label}</dt>
                <dd className="text-xl leading-7 tracking-[-0.02em] sm:text-[28px] sm:leading-9">{f.value}</dd>
              </div>
            ))}
          </dl>
          <div className="pt-2">
            <ButtonLink href="/about" variant="dark">
              Discover our story <ArrowRightIcon />
            </ButtonLink>
          </div>
        </div>
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden border border-line bg-surface">
            <Image
              src="/images/brand/story.jpg"
              alt="A man in a camel blazer and cream trousers seated against a warm plaster wall"
              fill
              sizes="(min-width: 1024px) 580px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute right-4 bottom-4 max-w-[320px] border border-line bg-white p-4 sm:right-auto sm:-left-6 sm:bottom-10">
            <p className="eyebrow">Our approach</p>
            <p className="mt-1 text-sm leading-[19px] font-medium">Fewer, better pieces — with fabric and fit details on every product.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
