import type { Metadata } from "next";
import { ProductListing } from "@/components/listing/product-listing";

export const metadata: Metadata = {
  title: "Sale",
  description: "Reduced prices on selected Brand Park men's clothing.",
  alternates: { canonical: "/sale" },
};

export default function SalePage({ searchParams }: PageProps<"/sale">) {
  return (
    <ProductListing
      title="Sale"
      description="Selected styles at reduced prices, while stock lasts."
      crumbs={[{ href: "/", label: "Home" }, { label: "Sale" }]}
      basePath="/sale"
      scope={{ sale: true }}
      searchParams={searchParams}
    />
  );
}
