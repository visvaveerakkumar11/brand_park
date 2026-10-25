import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Questions about sizing, an order or a return? Send the Brand Park team a message.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <ContentPage eyebrow="Customer service" title="Contact us" intro="Questions about sizing, an order or a return? Send us a message and we'll reply by email.">
      <p>
        Many answers are in our <Link href="/faq">FAQs</Link>. If you&apos;re writing about an order, include your order
        number (it starts with <strong>BP-</strong>) so we can help faster.
      </p>
      <div className="mt-8 border border-line p-6 text-ink">
        <ContactForm />
      </div>
    </ContentPage>
  );
}
