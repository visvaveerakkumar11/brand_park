import type { Metadata } from "next";
import Link from "next/link";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from "@/lib/config";
import { formatPrice } from "@/lib/money";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = { title: "Shipping Policy", alternates: { canonical: "/shipping-policy" } };

export default function ShippingPolicyPage() {
  return (
    <ContentPage eyebrow="Customer service" title="Shipping policy" intro="How delivery works for Brand Park orders.">
      <h2>Where we deliver</h2>
      <p>We deliver to addresses in India. A valid 6-digit PIN code and mobile number are required for every order.</p>
      <h2>Delivery charges</h2>
      <ul>
        <li>
          Free delivery on orders of <strong>{formatPrice(FREE_SHIPPING_THRESHOLD)}</strong> or more (after any discount).
        </li>
        <li>
          Orders below that amount have a delivery charge of <strong>{formatPrice(STANDARD_SHIPPING_FEE)}</strong>.
        </li>
        <li>The delivery charge is always shown in your order summary before you pay.</li>
      </ul>
      <h2>Order updates</h2>
      <p>
        Your order&apos;s status — confirmed, shipped or delivered — is shown on your order page. Signed-in customers can see every
        order under <Link href="/account/orders">My account → Orders</Link>.
      </p>
      <h2>Questions</h2>
      <p>
        For anything about a delivery, <Link href="/contact">contact us</Link> with your order number.
      </p>
    </ContentPage>
  );
}
