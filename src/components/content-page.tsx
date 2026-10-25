import { Breadcrumbs } from "@/components/listing/product-listing";

/** Shared shell for editorial and policy pages. */
export function ContentPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white py-10 sm:py-14">
      <div className="container-page">
        <Breadcrumbs crumbs={[{ href: "/", label: "Home" }, { label: title }]} />
        <div className="mt-8 max-w-[720px]">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="heading-display mt-2">{title}</h1>
          {intro && <p className="mt-4 text-base leading-7 text-ink-muted">{intro}</p>}
          <div className="prose-bp mt-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
