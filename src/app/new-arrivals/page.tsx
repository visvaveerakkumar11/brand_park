import type { Metadata } from "next";
import { ProductListing } from "@/components/listing/product-listing";

export const metadata: Metadata = {
  title: "New Arrivals",
  description: "The latest men's essentials to land at Brand Park.",
  alternates: { canonical: "/new-arrivals" },
};

export default function NewArrivalsPage({ searchParams }: PageProps<"/new-arrivals">) {
  return (
    <ProductListing
      title="New Arrivals"
      description="Refined proportions and breathable weights formulated for climate versatility and daily wearability."
      crumbs={[{ href: "/", label: "Home" }, { label: "New arrivals" }]}
      basePath="/new-arrivals"
      scope={{ isNew: true }}
      searchParams={searchParams}
    />
  );
}
