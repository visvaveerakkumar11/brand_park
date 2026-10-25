import type { Metadata } from "next";
import Link from "next/link";
import { PAYMENT_HOLD_MINUTES } from "@/lib/orders";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = { title: "Terms & Conditions", alternates: { canonical: "/terms-and-conditions" } };

export default function TermsPage() {
  return (
    <ContentPage eyebrow="Brand & policies" title="Terms & conditions" intro="The terms that apply when you shop with Brand Park.">
      <h2>Prices</h2>
      <p>
        All prices are in Indian Rupees (₹). The price, any discount and delivery charges are confirmed when you place your order,
        and the order total shown at checkout is the amount you pay.
      </p>
      <h2>Stock and orders</h2>
      <ul>
        <li>Items are reserved for you when you place an order. If an item sells out before then, we&apos;ll ask you to update your bag.</li>
        <li>Online orders that aren&apos;t paid within {PAYMENT_HOLD_MINUTES} minutes are cancelled automatically and the items released.</li>
        <li>An order is confirmed once payment succeeds, or straight away for cash on delivery where offered.</li>
      </ul>
      <h2>Discount codes</h2>
      <p>Codes may have conditions such as a minimum order value, an expiry date or a usage limit. They are validated when you place your order.</p>
      <h2>Your account</h2>
      <p>Keep your password private. You are responsible for activity on your account; contact us if you think someone else has used it.</p>
      <h2>Returns</h2>
      <p>
        See our <Link href="/return-policy">return policy</Link>.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about these terms? <Link href="/contact">Contact us</Link>.
      </p>
    </ContentPage>
  );
}
