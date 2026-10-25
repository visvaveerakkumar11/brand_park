import type { Metadata } from "next";
import Link from "next/link";
import { RETURN_WINDOW_DAYS } from "@/lib/config";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = { title: "Return Policy", alternates: { canonical: "/return-policy" } };

export default function ReturnPolicyPage() {
  return (
    <ContentPage eyebrow="Customer service" title="Return policy" intro={`You can return items within ${RETURN_WINDOW_DAYS} days of delivery.`}>
      <h2>Return window</h2>
      <p>
        Returns are accepted within <strong>{RETURN_WINDOW_DAYS} days</strong> of the date your order is delivered.
      </p>
      <h2>How to start a return</h2>
      <ul>
        <li>
          <Link href="/contact">Send us a message</Link> with your order number (it starts with BP-) and the items you&apos;d like
          to return.
        </li>
        <li>We&apos;ll reply by email with the next steps for your return.</li>
      </ul>
    </ContentPage>
  );
}
