import type { Metadata } from "next";
import Image from "next/image";
import { SITE } from "@/lib/config";
import { ButtonLink } from "@/components/ui/button";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "About Brand Park",
  description: `${SITE.name} — ${SITE.tagline} Contemporary men's essentials for modern everyday living.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <ContentPage eyebrow="The Brand Park manifesto" title="Good style. Everyday comfort." intro={`${SITE.tagline} Contemporary essentials crafted for modern everyday living.`}>
      <div className="relative mb-10 aspect-[16/10] overflow-hidden border border-line bg-surface">
        <Image
          src="/images/brand/story.jpg"
          alt="A man in a camel blazer seated against a warm plaster wall"
          fill
          sizes="(min-width: 768px) 720px, 100vw"
          className="object-cover object-[50%_30%]"
        />
      </div>
      <h2>Who we are</h2>
      <p>
        Brand Park is a men&apos;s clothing store. We bring together versatile clothing, contemporary design, and effortless
        style to help you feel confident in what you wear.
      </p>
      <p>
        Our edit focuses on the pieces men reach for most — t-shirts, shirts, jeans and trousers — chosen for considered
        fabrics and dependable fits rather than passing trends.
      </p>
      <h2>How we work</h2>
      <ul>
        <li>Every product lists its fabric, fit and care instructions.</li>
        <li>Prices, stock and discounts are confirmed on our servers when you check out.</li>
        <li>You can shop as a guest, or create an account to save addresses and track orders.</li>
      </ul>
      <div className="mt-10 flex flex-wrap gap-2">
        <ButtonLink href="/shop" variant="dark">Shop the collection</ButtonLink>
        <ButtonLink href="/contact" variant="outline">Contact us</ButtonLink>
      </div>
    </ContentPage>
  );
}
