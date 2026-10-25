import type { Metadata } from "next";
import { ProductListing } from "@/components/listing/product-listing";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <ProductListing
      title="Search"
      description="Find garments by name, fabric or category."
      crumbs={[{ href: "/", label: "Home" }, { label: "Search" }]}
      basePath="/search"
      scope={{ q: "" }}
      searchParams={searchParams}
    />
  );
}
