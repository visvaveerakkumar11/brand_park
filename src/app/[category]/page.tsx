import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCategories, getCategory } from "@/lib/catalog";
import { ProductListing } from "@/components/listing/product-listing";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[category]">): Promise<Metadata> {
  const category = await getCategory((await params).category);
  if (!category) return {};
  return {
    title: `Men's ${category.name}`,
    description: `Shop men's ${category.name.toLowerCase()} at Brand Park. ${category.description}`,
    alternates: { canonical: `/${category.slug}` },
  };
}

export default function CategoryPage({ params, searchParams }: PageProps<"/[category]">) {
  return (
    <Suspense fallback={<div className="container-page h-[60vh] animate-pulse bg-surface" aria-busy="true" />}>
      <CategoryListing params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CategoryListing({ params, searchParams }: PageProps<"/[category]">) {
  // Only real category slugs resolve here; anything else is a 404.
  const category = await getCategory((await params).category);
  if (!category) notFound();
  return (
    <ProductListing
      title={`Men's ${category.name}`}
      description={category.description}
      crumbs={[{ href: "/", label: "Home" }, { href: "/shop", label: "Shop" }, { label: category.name }]}
      basePath={`/${category.slug}`}
      scope={{ category: category.slug }}
      activeCategory={category.slug}
      searchParams={searchParams}
    />
  );
}
