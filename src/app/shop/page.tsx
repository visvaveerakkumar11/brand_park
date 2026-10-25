import type { Metadata } from "next";
import { ProductListing } from "@/components/listing/product-listing";

export const metadata: Metadata = {
  title: "Shop Men's Clothing",
  description: "Shop the full Brand Park men's collection: t-shirts, shirts, jeans and trousers.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage({ searchParams }: PageProps<"/shop">) {
  return (
    <ProductListing
      title="Men's Collection"
      description="Refined essentials engineered for modern living — structured tees, crisp shirts, dependable denim and tailored trousers."
      crumbs={[{ href: "/", label: "Home" }, { label: "Shop all" }]}
      basePath="/shop"
      searchParams={searchParams}
    />
  );
}
