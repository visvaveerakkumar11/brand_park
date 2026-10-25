import type { Metadata } from "next";
import { ProductListing } from "@/components/listing/product-listing";

export const metadata: Metadata = {
  title: "Best Sellers",
  description: "The Brand Park pieces customers come back for.",
  alternates: { canonical: "/best-sellers" },
};

export default function BestSellersPage({ searchParams }: PageProps<"/best-sellers">) {
  return (
    <ProductListing
      title="Best Sellers"
      description="The pieces our customers reach for again and again."
      crumbs={[{ href: "/", label: "Home" }, { label: "Best sellers" }]}
      basePath="/best-sellers"
      scope={{ bestSeller: true }}
      searchParams={searchParams}
    />
  );
}
